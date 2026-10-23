import type { ApartmentListing } from "@/types/hotel";
import type { GeoPoint } from "@/types/destination";
import {
  DEFAULT_FILTERS,
  type RentFilters,
} from "@/components/listings/filters/useRentFilters";
import {
  isOutsideCostaRica,
  normalizeSearchText,
  selectRentResults,
} from "./rent-results";

describe("rent-results selector and helpers", () => {
  const sampleListings: ApartmentListing[] = [
    {
      id: "1",
      name: "Apartamento Níspero",
      address: "Calle Los Ángeles, San José",
      description: "Lovely place",
      location: "San José",
      category: "Family",
      bedrooms: 2,
      bathrooms: 2,
      petFriendly: true,
      price: 100,
      rating: 4.8,
      owner: { name: "Maria", avatar: "/avatar1.jpg" },
      images: ["/test.jpg"],
      coordinates: { lat: 9.9333, lng: -84.0833 }, // San José
      promoted: false,
    },
    {
      id: "2",
      name: "Playa Hermosa Condo",
      address: "Guanacaste beach",
      description: "Beach condo",
      location: "Guanacaste",
      category: "Travelers",
      bedrooms: 3,
      bathrooms: 2,
      petFriendly: false,
      price: 180,
      rating: 4.9,
      owner: { name: "Carlos", avatar: "/avatar2.jpg" },
      images: ["/test2.jpg"],
      coordinates: { lat: 10.584, lng: -85.674 }, // Guanacaste (~180km from San José)
      promoted: false,
    },
  ];

  describe("normalizeSearchText", () => {
    it("handles query with accents ('Níspero' ↔ 'nispero')", () => {
      expect(normalizeSearchText("Níspero")).toBe("nispero");
      expect(normalizeSearchText("  NÍSPERO  ")).toBe("nispero");
      expect(normalizeSearchText("San José")).toBe("san jose");
    });
  });

  describe("isOutsideCostaRica", () => {
    it("returns false for null position or empty listings", () => {
      expect(isOutsideCostaRica(null, sampleListings)).toBe(false);
      expect(isOutsideCostaRica({ lat: 10, lng: -84 }, [])).toBe(false);
    });

    it("returns false when position is within 300km of listings", () => {
      const sanJosePos: GeoPoint = { lat: 9.93, lng: -84.08 };
      expect(isOutsideCostaRica(sanJosePos, sampleListings)).toBe(false);
    });

    it("returns true when position is outside Costa Rica (>300km)", () => {
      // Tokyo
      const tokyoPos: GeoPoint = { lat: 35.6762, lng: 139.6503 };
      expect(isOutsideCostaRica(tokyoPos, sampleListings)).toBe(true);
    });
  });

  describe("selectRentResults", () => {
    it("matches query with accents ('Níspero' ↔ 'nispero')", () => {
      const { results } = selectRentResults({
        listings: sampleListings,
        filters: DEFAULT_FILTERS,
        query: "nispero",
        position: null,
      });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("1");
    });

    it("handles a nearest deep link without a position: effective sort is relevance, and the filters object is unchanged", () => {
      const filtersWithNearest: RentFilters = {
        ...DEFAULT_FILTERS,
        sort: "nearest",
      };
      const originalFiltersCopy = { ...filtersWithNearest };

      const { results, sort, canSortByDistance } = selectRentResults({
        listings: sampleListings,
        filters: filtersWithNearest,
        query: "",
        position: null,
      });

      expect(canSortByDistance).toBe(false);
      expect(sort).toBe("relevance");
      expect(filtersWithNearest).toEqual(originalFiltersCopy);
      expect(filtersWithNearest.sort).toBe("nearest");
      expect(results).toHaveLength(2);
    });

    it("detects outside Costa Rica correctly and disables distance sort", () => {
      const tokyoPos: GeoPoint = { lat: 35.6762, lng: 139.6503 };
      const filtersWithNearest: RentFilters = {
        ...DEFAULT_FILTERS,
        sort: "nearest",
      };

      const { sort, canSortByDistance, outside, distances } = selectRentResults(
        {
          listings: sampleListings,
          filters: filtersWithNearest,
          query: "",
          position: tokyoPos,
        },
      );

      expect(outside).toBe(true);
      expect(canSortByDistance).toBe(false);
      expect(sort).toBe("relevance");
      expect(distances).toBeDefined();
    });

    it("sorts by distance order when sort is nearest and position is valid in Costa Rica", () => {
      // Position close to Guanacaste
      const nearGuanacastePos: GeoPoint = { lat: 10.58, lng: -85.67 };
      const { results, sort, canSortByDistance, distances } = selectRentResults(
        {
          listings: sampleListings,
          filters: { ...DEFAULT_FILTERS, sort: "nearest" },
          query: "",
          position: nearGuanacastePos,
        },
      );

      expect(canSortByDistance).toBe(true);
      expect(sort).toBe("nearest");
      expect(results[0].id).toBe("2"); // Guanacaste is closer
      expect(results[1].id).toBe("1"); // San José is farther
      expect(distances).toBeDefined();
      expect(distances![results[0].id]).toBeLessThan(distances![results[1].id]);
    });

    it("handles empty listings gracefully", () => {
      const { results, distances } = selectRentResults({
        listings: [],
        filters: DEFAULT_FILTERS,
        query: "anything",
        position: { lat: 9.93, lng: -84.08 },
      });

      expect(results).toEqual([]);
      expect(distances).toEqual({});
    });
  });
});
