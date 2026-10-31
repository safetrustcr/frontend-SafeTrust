import { APARTMENT_LISTINGS } from "./apartmentListings";

/** The published demo table from the listing-capacity issue. */
const EXPECTED_STAY_TABLE = [
  {
    id: "1",
    maxGuests: 4,
    maxInfants: 1,
    availability: { horizonDays: 365, booked: [{ startDay: 5, nights: 4 }] },
  },
  {
    id: "2",
    maxGuests: 2,
    maxInfants: 0,
    availability: { horizonDays: 365, booked: [{ startDay: 0, nights: 10 }] },
  },
  {
    id: "3",
    maxGuests: 2,
    maxInfants: 1,
    availability: { horizonDays: 365, booked: [{ startDay: 20, nights: 7 }] },
  },
  {
    id: "4",
    maxGuests: 6,
    maxInfants: 2,
    availability: {
      horizonDays: 365,
      booked: [
        { startDay: 3, nights: 3 },
        { startDay: 40, nights: 14 },
      ],
    },
  },
  {
    id: "5",
    maxGuests: 4,
    maxInfants: 1,
    availability: { horizonDays: 180, booked: [] },
  },
  {
    id: "6",
    maxGuests: 4,
    maxInfants: 1,
    availability: { horizonDays: 365, booked: [{ startDay: 12, nights: 5 }] },
  },
  {
    id: "7",
    maxGuests: 6,
    maxInfants: 2,
    availability: { horizonDays: 365, booked: [{ startDay: 1, nights: 30 }] },
  },
  {
    id: "8",
    maxGuests: 4,
    maxInfants: 1,
    availability: { horizonDays: 120, booked: [{ startDay: 7, nights: 7 }] },
  },
  {
    id: "9",
    maxGuests: 2,
    maxInfants: 0,
    availability: { horizonDays: 365, booked: [{ startDay: 0, nights: 2 }] },
  },
  {
    id: "10",
    maxGuests: 8,
    maxInfants: 2,
    availability: {
      horizonDays: 365,
      booked: [
        { startDay: 14, nights: 10 },
        { startDay: 60, nights: 21 },
      ],
    },
  },
  {
    id: "11",
    maxGuests: 4,
    maxInfants: 1,
    availability: { horizonDays: 365, booked: [{ startDay: 30, nights: 5 }] },
  },
  {
    id: "12",
    maxGuests: 3,
    maxInfants: 1,
    availability: { horizonDays: 90, booked: [{ startDay: 4, nights: 4 }] },
  },
];

describe("APARTMENT_LISTINGS stay metadata", () => {
  it("covers all 12 demo listings", () => {
    expect(APARTMENT_LISTINGS).toHaveLength(12);
    expect(APARTMENT_LISTINGS.map((listing) => listing.id)).toEqual(
      EXPECTED_STAY_TABLE.map((row) => row.id),
    );
  });

  it("defines maxGuests, maxInfants and availability on every listing", () => {
    for (const listing of APARTMENT_LISTINGS) {
      expect(typeof listing.maxGuests).toBe("number");
      expect(typeof listing.maxInfants).toBe("number");
      expect(listing.availability).toBeDefined();
      expect(Array.isArray(listing.availability?.booked)).toBe(true);
      expect(listing.availability?.horizonDays).toBeGreaterThan(0);
    }
  });

  it("matches the published capacity and availability table", () => {
    const rows = APARTMENT_LISTINGS.map((listing) => ({
      id: listing.id,
      maxGuests: listing.maxGuests,
      maxInfants: listing.maxInfants,
      availability: listing.availability,
    }));
    expect(rows).toEqual(EXPECTED_STAY_TABLE);
  });

  it("keeps every guest/date rule exercisable", () => {
    const capacities = APARTMENT_LISTINGS.map((listing) => listing.maxGuests);
    const horizons = APARTMENT_LISTINGS.map(
      (listing) => listing.availability?.horizonDays,
    );
    // At least one small, one large, one non-pet and one short-horizon listing.
    expect(Math.min(...(capacities as number[]))).toBeLessThanOrEqual(2);
    expect(Math.max(...(capacities as number[]))).toBeGreaterThanOrEqual(8);
    expect(APARTMENT_LISTINGS.some((listing) => !listing.petFriendly)).toBe(
      true,
    );
    expect(Math.min(...(horizons as number[]))).toBeLessThanOrEqual(180);
    expect(
      APARTMENT_LISTINGS.some((listing) => listing.availability?.booked.length),
    ).toBe(true);
    expect(
      APARTMENT_LISTINGS.some(
        (listing) => listing.availability?.booked.length === 0,
      ),
    ).toBe(true);
  });

  it("keeps every demo booking inside its published horizon", () => {
    for (const listing of APARTMENT_LISTINGS) {
      for (const booking of listing.availability?.booked ?? []) {
        expect(booking.startDay).toBeGreaterThanOrEqual(0);
        expect(booking.nights).toBeGreaterThanOrEqual(1);
        expect(booking.startDay + booking.nights).toBeLessThanOrEqual(
          listing.availability?.horizonDays ?? 0,
        );
      }
    }
  });
});
