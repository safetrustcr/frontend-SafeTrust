import { existsSync } from "node:fs";
import path from "node:path";
import {
  APARTMENT_CATEGORIES,
  APARTMENT_LISTINGS,
  APARTMENT_LOCATIONS,
  getApartmentById,
} from "./apartmentListings";

describe("APARTMENT_LISTINGS", () => {
  it("contains unique listing IDs and unique lead photos", () => {
    expect(
      new Set(APARTMENT_LISTINGS.map((apartment) => apartment.id)).size,
    ).toBe(APARTMENT_LISTINGS.length);
    expect(
      new Set(APARTMENT_LISTINGS.map((apartment) => apartment.images[0])).size,
    ).toBe(APARTMENT_LISTINGS.length);
  });

  it("covers every location and category with complete local photo sets", () => {
    expect(
      new Set(APARTMENT_LISTINGS.map((apartment) => apartment.location)),
    ).toEqual(new Set(APARTMENT_LOCATIONS));
    expect(
      new Set(APARTMENT_LISTINGS.map((apartment) => apartment.category)),
    ).toEqual(new Set(APARTMENT_CATEGORIES));

    for (const apartment of APARTMENT_LISTINGS) {
      expect(new Set(apartment.images).size).toBe(4);
      expect(
        apartment.description
          .trim()
          .split(/[.!?]+/)
          .filter(Boolean).length,
      ).toBeGreaterThanOrEqual(2);
      for (const image of apartment.images) {
        expect(existsSync(path.join("public", image))).toBe(true);
      }
      expect(existsSync(path.join("public", apartment.owner.avatar))).toBe(
        true,
      );
    }
  });

  it("falls back to the first listing for unknown IDs", () => {
    expect(getApartmentById("not-a-listing")).toBe(APARTMENT_LISTINGS[0]);
  });
});
