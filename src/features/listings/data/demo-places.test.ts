import { APARTMENT_LISTINGS } from "./demo-listings";
import { DEMO_PLACES } from "./demo-places";

describe("DEMO_PLACES", () => {
  it("has unique ids", () => {
    const ids = DEMO_PLACES.map((place) => place.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(DEMO_PLACES.map((place) => [place.id, place] as const))(
    "%s has at least one listing in its province",
    (id, place) => {
      const listings = APARTMENT_LISTINGS.filter((l) => l.placeId === id);
      expect(listings.length).toBeGreaterThan(0);
      for (const listing of listings) {
        expect(listing.location).toBe(place.province);
      }
    },
  );

  it.each(APARTMENT_LISTINGS.map((listing) => [listing.id, listing] as const))(
    "listing %s has a placeId from the catalog that its address names",
    (_id, listing) => {
      const place = DEMO_PLACES.find((p) => p.id === listing.placeId);
      expect(place).toBeDefined();
      expect(listing.address).toContain(place!.name);
    },
  );
});
