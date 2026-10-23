import { applyRentFilters } from "@/components/listings/filters/applyRentFilters";
import { DEFAULT_FILTERS } from "@/components/listings/filters/useRentFilters";
import { APARTMENT_LISTINGS } from "@/lib/mockData/apartmentListings";
import type { ApartmentListing } from "@/types/hotel";
import { addDays, type IsoDate } from "./date-only";
import {
  applyStaySearch,
  candidateStays,
  isRangeAvailable,
  matchesDates,
  matchesGuests,
  overlaps,
  type StayRange,
} from "./match-stay";
import { parseStaySearch, type StaySearch } from "./stay-search";

/** Fixed "today" so every expected id below is deterministic. */
const TODAY: IsoDate = "2026-03-02";

const stay = (query: string): StaySearch =>
  parseStaySearch(new URLSearchParams(query));

const idsOf = (listings: ApartmentListing[]) =>
  listings.map((listing) => listing.id).sort((left, right) => +left - +right);

const listing = (patch: Partial<ApartmentListing> = {}): ApartmentListing => ({
  ...APARTMENT_LISTINGS[0],
  id: "test",
  ...patch,
});

describe("applyStaySearch on the demo fixtures", () => {
  it("returns all 12 listings with no guest or date constraints", () => {
    expect(idsOf(applyStaySearch(APARTMENT_LISTINGS, stay(""), TODAY))).toEqual(
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    );
  });

  it("excludes every listing for adults=10 (none fits 10 guests)", () => {
    expect(
      applyStaySearch(APARTMENT_LISTINGS, stay("adults=10"), TODAY),
    ).toEqual([]);
  });

  it("keeps pet-friendly listings with capacity for adults=2&pets=1", () => {
    expect(
      idsOf(
        applyStaySearch(APARTMENT_LISTINGS, stay("adults=2&pets=1"), TODAY),
      ),
    ).toEqual(["1", "4", "6", "7", "10", "11"]);
  });

  it("keeps only listings with capacity for adults=6", () => {
    expect(
      idsOf(applyStaySearch(APARTMENT_LISTINGS, stay("adults=6"), TODAY)),
    ).toEqual(["4", "7", "10"]);
  });

  it("excludes infants over the listing's maxInfants", () => {
    // No demo listing takes 3 infants.
    expect(
      applyStaySearch(APARTMENT_LISTINGS, stay("adults=2&infants=3"), TODAY),
    ).toEqual([]);
    // maxInfants=0 listings (2 and 9) drop out for a single infant.
    expect(
      idsOf(
        applyStaySearch(APARTMENT_LISTINGS, stay("adults=4&infants=1"), TODAY),
      ),
    ).toEqual(["1", "4", "5", "6", "7", "8", "10", "11"]);
  });

  it("excludes booked listings for an exact range", () => {
    // [today+5, today+7) sits inside the bookings of listings 1, 2, 4, 7 and 12.
    const search: StaySearch = {
      q: "",
      guests: { adults: 0, children: 0, infants: 0, pets: 0 },
      dates: {
        mode: "exact",
        checkIn: addDays(TODAY, 5),
        checkOut: addDays(TODAY, 7),
      },
    };
    expect(idsOf(applyStaySearch(APARTMENT_LISTINGS, search, TODAY))).toEqual([
      "3",
      "5",
      "6",
      "8",
      "9",
      "10",
      "11",
    ]);
  });

  it("combines guest and date constraints", () => {
    const search = stay("adults=6");
    search.dates = {
      mode: "exact",
      checkIn: addDays(TODAY, 5),
      checkOut: addDays(TODAY, 7),
    };
    // Listings 4 and 7 are booked on those nights; 10 fits 6 guests.
    expect(idsOf(applyStaySearch(APARTMENT_LISTINGS, search, TODAY))).toEqual([
      "10",
    ]);
  });
});

describe("matchesGuests", () => {
  it('matches everything for the zero-guest "Any guests" search', () => {
    expect(
      APARTMENT_LISTINGS.every((item) =>
        matchesGuests(item, { adults: 0, children: 0, infants: 0, pets: 0 }),
      ),
    ).toBe(true);
  });

  it("requires pet-friendly listings when pets travel", () => {
    expect(
      matchesGuests(
        listing({ petFriendly: false }),
        stay("adults=1&pets=1").guests,
      ),
    ).toBe(false);
    expect(
      matchesGuests(
        listing({ petFriendly: true }),
        stay("adults=1&pets=1").guests,
      ),
    ).toBe(true);
  });
});

describe("isRangeAvailable (half-open nights)", () => {
  // One booking: [today+5, today+9).
  const booked = listing({
    availability: {
      horizonDays: 365,
      booked: [{ startDay: 5, nights: 4 }],
    },
  });

  it("lets a stay end on the booking's first night", () => {
    expect(
      isRangeAvailable(
        booked,
        { start: addDays(TODAY, 1), end: addDays(TODAY, 5) },
        TODAY,
      ),
    ).toBe(true);
  });

  it("lets a stay start on the booking's check-out day", () => {
    expect(
      isRangeAvailable(
        booked,
        { start: addDays(TODAY, 9), end: addDays(TODAY, 12) },
        TODAY,
      ),
    ).toBe(true);
  });

  it("rejects a stay sharing a single night with the booking", () => {
    expect(
      isRangeAvailable(
        booked,
        { start: addDays(TODAY, 4), end: addDays(TODAY, 6) },
        TODAY,
      ),
    ).toBe(false);
    expect(
      isRangeAvailable(
        booked,
        { start: addDays(TODAY, 8), end: addDays(TODAY, 10) },
        TODAY,
      ),
    ).toBe(false);
  });

  it("rejects a stay inside the booking", () => {
    expect(
      isRangeAvailable(
        booked,
        { start: addDays(TODAY, 6), end: addDays(TODAY, 7) },
        TODAY,
      ),
    ).toBe(false);
  });

  it("treats unknown availability as not available", () => {
    const unknown = listing({ availability: undefined });
    expect(
      isRangeAvailable(
        unknown,
        { start: addDays(TODAY, 1), end: addDays(TODAY, 3) },
        TODAY,
      ),
    ).toBe(false);
  });

  it('rejects stays reaching past horizonDays ("unknown" is not available)', () => {
    const shortHorizon = listing({
      availability: { horizonDays: 180, booked: [] },
    });
    expect(
      isRangeAvailable(
        shortHorizon,
        { start: addDays(TODAY, 179), end: addDays(TODAY, 180) },
        TODAY,
      ),
    ).toBe(true);
    expect(
      isRangeAvailable(
        shortHorizon,
        { start: addDays(TODAY, 179), end: addDays(TODAY, 181) },
        TODAY,
      ),
    ).toBe(false);
  });

  it("rejects stays starting before today", () => {
    expect(
      isRangeAvailable(
        booked,
        { start: addDays(TODAY, -1), end: addDays(TODAY, 1) },
        TODAY,
      ),
    ).toBe(false);
  });
});

describe("overlaps", () => {
  const range = (start: number, end: number): StayRange => ({
    start: addDays(TODAY, start),
    end: addDays(TODAY, end),
  });

  it("is half-open: touching edges do not overlap", () => {
    expect(overlaps(range(0, 5), range(5, 10))).toBe(false);
    expect(overlaps(range(5, 10), range(0, 5))).toBe(false);
  });

  it("detects shared nights", () => {
    expect(overlaps(range(0, 6), range(5, 10))).toBe(true);
    expect(overlaps(range(0, 10), range(5, 6))).toBe(true);
  });
});

describe("candidateStays and matchesDates", () => {
  it('returns null for "any" dates, one range for exact dates, none for flexible', () => {
    expect(candidateStays({ mode: "any" }, TODAY)).toBeNull();
    expect(
      candidateStays(
        { mode: "exact", checkIn: "2026-05-01", checkOut: "2026-05-08" },
        TODAY,
      ),
    ).toEqual([{ start: "2026-05-01", end: "2026-05-08" }]);
    expect(candidateStays({ mode: "flexible" }, TODAY)).toEqual([]);
  });

  it('matches every listing for "any" dates and none for flexible dates', () => {
    expect(
      APARTMENT_LISTINGS.every((item) =>
        matchesDates(item, { mode: "any" }, TODAY),
      ),
    ).toBe(true);
    expect(
      APARTMENT_LISTINGS.some((item) =>
        matchesDates(item, { mode: "flexible" }, TODAY),
      ),
    ).toBe(false);
  });
});

describe("listings without stay metadata", () => {
  const bare: ApartmentListing = {
    ...APARTMENT_LISTINGS[0],
    id: "bare",
    maxGuests: undefined,
    maxInfants: undefined,
    availability: undefined,
  };

  it("match only while no guest or date constraint is active", () => {
    expect(
      matchesGuests(bare, { adults: 0, children: 0, infants: 0, pets: 0 }),
    ).toBe(true);
    expect(
      matchesGuests(bare, { adults: 1, children: 0, infants: 0, pets: 0 }),
    ).toBe(false);
    expect(matchesDates(bare, { mode: "any" }, TODAY)).toBe(true);
    expect(
      matchesDates(
        bare,
        { mode: "exact", checkIn: TODAY, checkOut: addDays(TODAY, 1) },
        TODAY,
      ),
    ).toBe(false);
  });

  it("is included without constraints and excluded with them", () => {
    const listings = [...APARTMENT_LISTINGS, bare];
    expect(
      idsOf(applyStaySearch(listings, stay(""), TODAY)).includes("bare"),
    ).toBe(true);
    expect(
      applyStaySearch(listings, stay("adults=1"), TODAY).some(
        (item) => item.id === "bare",
      ),
    ).toBe(false);
    expect(
      applyStaySearch(
        listings,
        {
          q: "",
          guests: { adults: 0, children: 0, infants: 0, pets: 0 },
          dates: {
            mode: "exact",
            checkIn: TODAY,
            checkOut: addDays(TODAY, 1),
          },
        },
        TODAY,
      ).some((item) => item.id === "bare"),
    ).toBe(false);
  });
});

describe("immutability and ordering", () => {
  it("does not mutate the input array or the listing objects", () => {
    const snapshot = JSON.parse(JSON.stringify(APARTMENT_LISTINGS));
    const sorted = applyRentFilters(APARTMENT_LISTINGS, {
      ...DEFAULT_FILTERS,
      sort: "price-high",
    });
    applyStaySearch(sorted, stay("adults=2&pets=1"), TODAY);
    expect(APARTMENT_LISTINGS).toEqual(snapshot);
  });

  it("keeps the existing promoted-first ordering of applyRentFilters", () => {
    const sorted = applyRentFilters(APARTMENT_LISTINGS, { ...DEFAULT_FILTERS });
    const filtered = applyStaySearch(sorted, stay("adults=2&pets=1"), TODAY);
    const sortedIds = sorted.map((item) => item.id);
    expect(filtered.map((item) => item.id)).toEqual(
      sortedIds.filter((id) => ["1", "4", "6", "7", "10", "11"].includes(id)),
    );
    expect(filtered.slice(0, 2).every((item) => item.promoted)).toBe(true);
  });

  it("keeps the price ordering of applyRentFilters", () => {
    const priceSorted = applyRentFilters(APARTMENT_LISTINGS, {
      ...DEFAULT_FILTERS,
      sort: "price-low",
    });
    const filtered = applyStaySearch(priceSorted, stay("adults=2"), TODAY);
    const prices = filtered.map((item) => item.price);
    expect([...prices].sort((left, right) => left - right)).toEqual(prices);
  });
});
