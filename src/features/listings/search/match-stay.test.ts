import { applyRentFilters } from "@/components/listings/filters/applyRentFilters";
import { DEFAULT_FILTERS } from "@/components/listings/filters/useRentFilters";
import { APARTMENT_LISTINGS } from "@/lib/mockData/apartmentListings";
import type { ApartmentListing } from "@/types/hotel";
import { addDays, type IsoDate } from "./date-only";
import {
  applyStaySearch,
  candidateStays,
  daysInMonth,
  isFriday,
  isRangeAvailable,
  matchesDates,
  matchesGuests,
  overlaps,
  type StayRange,
} from "./match-stay";
import {
  parseStaySearch,
  type DateSearch,
  type StaySearch,
} from "./stay-search";

/** Fixed "today" so every expected id below is deterministic. */
const TODAY: IsoDate = "2026-03-02";

const stay = (query: string): StaySearch =>
  parseStaySearch(new URLSearchParams(query), TODAY);

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
      place: null,
      guests: { adults: 0, children: 0, infants: 0, pets: 0 },
      dates: {
        mode: "exact",
        checkIn: addDays(TODAY, 5),
        checkOut: addDays(TODAY, 7),
        tolerance: 0,
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
      tolerance: 0,
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
        {
          mode: "exact",
          checkIn: "2026-05-01",
          checkOut: "2026-05-08",
          tolerance: 0,
        },
        TODAY,
      ),
    ).toEqual([{ start: "2026-05-01", end: "2026-05-08" }]);
    expect(
      candidateStays(
        { mode: "flexible", stay: "weekend", months: ["2026-05"] },
        TODAY,
      ),
    ).toEqual([
      { start: "2026-05-01", end: "2026-05-03" },
      { start: "2026-05-08", end: "2026-05-10" },
      { start: "2026-05-15", end: "2026-05-17" },
      { start: "2026-05-22", end: "2026-05-24" },
      { start: "2026-05-29", end: "2026-05-31" },
    ]);
  });

  it('matches every listing for "any" dates and matches flexible dates for available listings', () => {
    expect(
      APARTMENT_LISTINGS.every((item) =>
        matchesDates(item, { mode: "any" }, TODAY),
      ),
    ).toBe(true);
    expect(
      APARTMENT_LISTINGS.some((item) =>
        matchesDates(
          item,
          { mode: "flexible", stay: "week", months: ["2026-05"] },
          TODAY,
        ),
      ),
    ).toBe(true);
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
        {
          mode: "exact",
          checkIn: TODAY,
          checkOut: addDays(TODAY, 1),
          tolerance: 0,
        },
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
          place: null,
          guests: { adults: 0, children: 0, infants: 0, pets: 0 },
          dates: {
            mode: "exact",
            checkIn: TODAY,
            checkOut: addDays(TODAY, 1),
            tolerance: 0,
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

describe("match-stay", () => {
  const today = "2026-11-01"; // Sunday

  describe("helper functions", () => {
    it("correctly identifies Fridays in UTC", () => {
      // 2026-11-06 is Friday
      expect(isFriday("2026-11-06")).toBe(true);
      expect(isFriday("2026-11-13")).toBe(true);
      expect(isFriday("2026-11-20")).toBe(true);
      expect(isFriday("2026-11-27")).toBe(true);

      // 2026-11-01 is Sunday, 2026-11-07 is Saturday
      expect(isFriday("2026-11-01")).toBe(false);
      expect(isFriday("2026-11-07")).toBe(false);
    });

    it("correctly returns the number of days in each month including leap years", () => {
      expect(daysInMonth("2026-01")).toBe(31);
      expect(daysInMonth("2026-02")).toBe(28); // non-leap
      expect(daysInMonth("2028-02")).toBe(29); // leap year
      expect(daysInMonth("2026-04")).toBe(30);
      expect(daysInMonth("2026-11")).toBe(30);
      expect(daysInMonth("2026-12")).toBe(31);
    });
  });

  describe("candidateStays", () => {
    it("returns null for mode 'any'", () => {
      const dates: DateSearch = { mode: "any" };
      expect(candidateStays(dates, today)).toBeNull();
    });

    it("returns a single range for exact mode with tolerance 0", () => {
      const dates: DateSearch = {
        mode: "exact",
        checkIn: "2026-11-10",
        checkOut: "2026-11-15",
        tolerance: 0,
      };
      expect(candidateStays(dates, today)).toEqual([
        { start: "2026-11-10", end: "2026-11-15" },
      ]);
    });

    it("enumerates ±1 day shifts for exact mode with tolerance 1", () => {
      const dates: DateSearch = {
        mode: "exact",
        checkIn: "2026-11-10",
        checkOut: "2026-11-15",
        tolerance: 1,
      };
      expect(candidateStays(dates, today)).toEqual([
        { start: "2026-11-09", end: "2026-11-14" },
        { start: "2026-11-10", end: "2026-11-15" },
        { start: "2026-11-11", end: "2026-11-16" },
      ]);
    });

    it("enumerates ±2 day shifts for exact mode with tolerance 2", () => {
      const dates: DateSearch = {
        mode: "exact",
        checkIn: "2026-11-10",
        checkOut: "2026-11-15",
        tolerance: 2,
      };
      expect(candidateStays(dates, today)).toEqual([
        { start: "2026-11-08", end: "2026-11-13" },
        { start: "2026-11-09", end: "2026-11-14" },
        { start: "2026-11-10", end: "2026-11-15" },
        { start: "2026-11-11", end: "2026-11-16" },
        { start: "2026-11-12", end: "2026-11-17" },
      ]);
    });

    it("skips shifts that would start before today", () => {
      const fixedToday = "2026-11-02";
      const dates: DateSearch = {
        mode: "exact",
        checkIn: "2026-11-02",
        checkOut: "2026-11-06",
        tolerance: 2,
      };
      // Shift -2 (2026-10-31) and shift -1 (2026-11-01) start before today (2026-11-02)
      expect(candidateStays(dates, fixedToday)).toEqual([
        { start: "2026-11-02", end: "2026-11-06" }, // shift 0
        { start: "2026-11-03", end: "2026-11-07" }, // shift +1
        { start: "2026-11-04", end: "2026-11-08" }, // shift +2
      ]);
    });

    it("generates weekend stays checking in on Fridays only (2 nights)", () => {
      const dates: DateSearch = {
        mode: "flexible",
        stay: "weekend",
        months: ["2026-11"],
      };
      const candidates = candidateStays(dates, "2026-11-01")!;
      expect(candidates).toHaveLength(4); // Nov 2026 has 4 Fridays: 6, 13, 20, 27
      for (const stay of candidates) {
        expect(isFriday(stay.start)).toBe(true);
      }
      expect(candidates).toEqual([
        { start: "2026-11-06", end: "2026-11-08" },
        { start: "2026-11-13", end: "2026-11-15" },
        { start: "2026-11-20", end: "2026-11-22" },
        { start: "2026-11-27", end: "2026-11-29" },
      ]);
    });

    it("generates 7-night week stays on any day of the month", () => {
      const dates: DateSearch = {
        mode: "flexible",
        stay: "week",
        months: ["2026-11"],
      };
      const candidates = candidateStays(dates, "2026-11-01")!;
      expect(candidates).toHaveLength(30); // 30 days in November
      expect(candidates[0]).toEqual({
        start: "2026-11-01",
        end: "2026-11-08",
      });
      // Check-out crosses into next month
      expect(candidates[29]).toEqual({
        start: "2026-11-30",
        end: "2026-12-07",
      });
    });

    it("generates 30-night month stays on any day of the month", () => {
      const dates: DateSearch = {
        mode: "flexible",
        stay: "month",
        months: ["2026-11"],
      };
      const candidates = candidateStays(dates, "2026-11-01")!;
      expect(candidates).toHaveLength(30);
      expect(candidates[0]).toEqual({
        start: "2026-11-01",
        end: "2026-12-01",
      });
      expect(candidates[29]).toEqual({
        start: "2026-11-30",
        end: "2026-12-30",
      });
    });

    it("supports check-out crossing into the next month for flexible stays", () => {
      const dates: DateSearch = {
        mode: "flexible",
        stay: "week",
        months: ["2026-11"],
      };
      const candidates = candidateStays(dates, "2026-11-28")!;
      // November 28, 29, 30 are on or after today (2026-11-28)
      expect(candidates).toEqual([
        { start: "2026-11-28", end: "2026-12-05" },
        { start: "2026-11-29", end: "2026-12-06" },
        { start: "2026-11-30", end: "2026-12-07" },
      ]);
    });

    it("generates all 29 days for February 2028 (leap year)", () => {
      const dates: DateSearch = {
        mode: "flexible",
        stay: "week",
        months: ["2028-02"],
      };
      const candidates = candidateStays(dates, "2028-02-01")!;
      expect(candidates).toHaveLength(29);
      expect(candidates[28]).toEqual({
        start: "2028-02-29",
        end: "2028-03-07",
      });
    });

    it("skips flexible days that fall before today", () => {
      const dates: DateSearch = {
        mode: "flexible",
        stay: "week",
        months: ["2026-11"],
      };
      // Today is Nov 20, so days 1..19 must be skipped
      const candidates = candidateStays(dates, "2026-11-20")!;
      expect(candidates).toHaveLength(11); // days 20..30
      expect(candidates[0].start).toBe("2026-11-20");
    });
  });

  describe("overlaps", () => {
    it("respects half-open ranges [start, end)", () => {
      const stay: StayRange = { start: "2026-11-05", end: "2026-11-10" };

      // Stay ending on booking start does NOT overlap (same-day checkout / check-in)
      expect(overlaps({ start: "2026-11-01", end: "2026-11-05" }, stay)).toBe(
        false,
      );

      // Stay starting on booking end does NOT overlap
      expect(overlaps({ start: "2026-11-10", end: "2026-11-15" }, stay)).toBe(
        false,
      );

      // A single shared night overlaps
      expect(overlaps({ start: "2026-11-09", end: "2026-11-12" }, stay)).toBe(
        true,
      );

      expect(overlaps({ start: "2026-11-04", end: "2026-11-06" }, stay)).toBe(
        true,
      );
    });
  });

  describe("availability and date matching", () => {
    const baseListing: ApartmentListing = {
      id: "test-1",
      name: "Test Apartment",
      address: "San José",
      coordinates: { lat: 9.93, lng: -84.06 },
      price: 100,
      promoted: false,
      images: [],
      category: "Family",
      location: "San José",
      bedrooms: 2,
      bathrooms: 1,
      petFriendly: true,
      owner: { name: "Host", avatar: "" },
      description: "Nice place",
      rating: 5,
      availability: {
        horizonDays: 180,
        booked: [{ startDay: 10, nights: 5 }], // booked Nov 11 to Nov 16
      },
    };

    it("returns false for listing without availability metadata", () => {
      const withoutAvail: ApartmentListing = {
        ...baseListing,
        availability: undefined,
      };
      expect(
        isRangeAvailable(
          withoutAvail,
          { start: "2026-11-01", end: "2026-11-05" },
          "2026-11-01",
        ),
      ).toBe(false);
    });

    it("returns false when range starts before today or exceeds horizon", () => {
      // starts before today
      expect(
        isRangeAvailable(
          baseListing,
          { start: "2026-10-30", end: "2026-11-04" },
          "2026-11-01",
        ),
      ).toBe(false);

      // exceeds 180-day horizon
      expect(
        isRangeAvailable(
          baseListing,
          { start: "2027-06-01", end: "2027-06-10" },
          "2026-11-01",
        ),
      ).toBe(false);
    });

    it("with a booked exact range, flex=1 matches only if a same-length stay one day earlier or later is free (exact ids asserted)", () => {
      // Fixed clock: today = 2026-11-01
      // Search: checkIn = 2026-11-11, checkOut = 2026-11-16 (5 nights)
      // Listing 1: booked 2026-11-10 (startDay 9) for 8 nights (days 9..17) -> all shifts [-1, 0, +1] overlap
      // Listing 2: booked 2026-11-11 (startDay 10) for 5 nights (days 10..15) -> shift -1 (Nov 10..15) and shift +1 (Nov 12..17) still overlap
      // Listing 3: booked ONLY on 2026-11-11 (startDay 10, 1 night) -> shift -1 (Nov 10..15) overlaps, shift 0 overlaps, BUT shift +1 (Nov 12..17) is FREE!
      // Listing 4: booked on 2026-11-10 (1 night) AND 2026-11-16 (1 night) -> shift 0 overlaps neither booking! (free at exact dates)

      const listings: ApartmentListing[] = [
        {
          ...baseListing,
          id: "listing-all-blocked",
          availability: {
            horizonDays: 365,
            booked: [{ startDay: 9, nights: 8 }], // Nov 10 to Nov 18
          },
        },
        {
          ...baseListing,
          id: "listing-exact-and-shifts-blocked",
          availability: {
            horizonDays: 365,
            booked: [{ startDay: 10, nights: 5 }], // Nov 11 to Nov 16
          },
        },
        {
          ...baseListing,
          id: "listing-free-one-day-later",
          availability: {
            horizonDays: 365,
            booked: [{ startDay: 10, nights: 1 }], // booked only on Nov 11 (Nov 11..12)
          },
        },
        {
          ...baseListing,
          id: "listing-free-one-day-earlier",
          availability: {
            horizonDays: 365,
            booked: [{ startDay: 11, nights: 5 }], // booked Nov 12 to Nov 17
          },
        },
      ];

      // Exact search (tolerance 0):
      // checkIn: 2026-11-11 (startDay 10), checkOut: 2026-11-16 (startDay 15)
      const exactSearch: DateSearch = {
        mode: "exact",
        checkIn: "2026-11-11",
        checkOut: "2026-11-16",
        tolerance: 0,
      };

      const exactMatches = listings
        .filter((l) => matchesDates(l, exactSearch, "2026-11-01"))
        .map((l) => l.id);

      // In exactSearch (Nov 11..16):
      // listing-all-blocked: overlaps Nov 10..18 -> false
      // listing-exact-and-shifts-blocked: overlaps Nov 11..16 -> false
      // listing-free-one-day-later: overlaps Nov 11..12 -> false
      // listing-free-one-day-earlier: overlaps Nov 12..17 -> false
      expect(exactMatches).toEqual([]);

      // Tolerance 1 search (flex=1):
      // candidate shifts:
      // -1: Nov 10..15
      //  0: Nov 11..16
      // +1: Nov 12..17
      const flexSearch: DateSearch = {
        mode: "exact",
        checkIn: "2026-11-11",
        checkOut: "2026-11-16",
        tolerance: 1,
      };

      const flexMatches = listings
        .filter((l) => matchesDates(l, flexSearch, "2026-11-01"))
        .map((l) => l.id);

      // listing-all-blocked: all shifts blocked -> false
      // listing-exact-and-shifts-blocked: Nov 11..16 overlaps all shifts -> false
      // listing-free-one-day-later: Nov 12..17 (shift +1) is free! -> TRUE
      // listing-free-one-day-earlier: Nov 10..15 (shift -1) overlaps Nov 12..17 on Nov 12..15 -> false
      expect(flexMatches).toEqual(["listing-free-one-day-later"]);
    });
  });
});
