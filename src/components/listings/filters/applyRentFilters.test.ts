import { APARTMENT_LISTINGS } from "@/lib/mockData/apartmentListings";
import { applyRentFilters } from "./applyRentFilters";
import {
  DEFAULT_FILTERS,
  parseFilters,
  type RentFilters,
} from "./useRentFilters";

describe("parseFilters", () => {
  it("uses all listings and broad price bounds by default", () => {
    expect(parseFilters(new URLSearchParams())).toEqual(DEFAULT_FILTERS);
  });

  it("parses valid filter params", () => {
    expect(
      parseFilters(
        new URLSearchParams(
          "categories=Family,Travelers&location=Heredia&bedrooms=2&min=1000&max=5000&sort=price-low",
        ),
      ),
    ).toEqual({
      categories: ["Family", "Travelers"],
      location: "Heredia",
      bedrooms: "2",
      minPrice: 1000,
      maxPrice: 5000,
      sort: "price-low",
    });
  });

  it("ignores invalid values and falls back to defaults", () => {
    expect(
      parseFilters(
        new URLSearchParams(
          "categories=Other&location=Nowhere&bedrooms=5&min=invalid&max=300000&sort=unknown",
        ),
      ),
    ).toEqual(DEFAULT_FILTERS);
  });

  it("falls back to default price bounds when the range is invalid", () => {
    expect(parseFilters(new URLSearchParams("min=9000&max=1000"))).toEqual(
      DEFAULT_FILTERS,
    );
  });

  it("clamps an out-of-range price bound without discarding the valid bound", () => {
    expect(
      parseFilters(new URLSearchParams("min=1000&max=300000")),
    ).toMatchObject({
      minPrice: 1000,
      maxPrice: 250_000,
    });
    expect(
      parseFilters(new URLSearchParams("min=-1000&max=5000")),
    ).toMatchObject({
      minPrice: 0,
      maxPrice: 5000,
    });
  });
});

describe("applyRentFilters", () => {
  const filter = (patch: Partial<RentFilters>) =>
    applyRentFilters(APARTMENT_LISTINGS, { ...DEFAULT_FILTERS, ...patch });

  it("returns every listing by default", () => {
    expect(filter({})).toHaveLength(APARTMENT_LISTINGS.length);
  });

  it("filters by category", () => {
    expect(
      filter({ categories: ["Travelers"] }).map((item) => item.category),
    ).toEqual(["Travelers", "Travelers"]);
  });

  it("filters by location", () => {
    expect(
      filter({ location: "Heredia" }).map((item) => item.location),
    ).toEqual(["Heredia"]);
  });

  it("filters by bedroom count", () => {
    expect(filter({ bedrooms: "1" }).map((item) => item.bedrooms)).toEqual([1]);
  });

  it("includes apartments with three or more bedrooms in the 3-bedroom filter", () => {
    const threeBedroomAndLarger = [
      APARTMENT_LISTINGS[3],
      { ...APARTMENT_LISTINGS[3], id: "larger", bedrooms: 4 },
    ];

    expect(
      applyRentFilters(threeBedroomAndLarger, {
        ...DEFAULT_FILTERS,
        bedrooms: "3",
      }).map((item) => item.bedrooms),
    ).toEqual([3, 4]);
  });

  it("filters by price range", () => {
    expect(
      filter({ minPrice: 4000, maxPrice: 4050 }).map((item) => item.price),
    ).toEqual([4000]);
  });

  it("sorts by price in both directions and relevance by promotion", () => {
    expect(filter({ sort: "price-low" }).map((item) => item.price)).toEqual(
      [...APARTMENT_LISTINGS].map((item) => item.price).sort((a, b) => a - b),
    );
    expect(filter({ sort: "price-high" }).map((item) => item.price)).toEqual(
      [...APARTMENT_LISTINGS].map((item) => item.price).sort((a, b) => b - a),
    );
    const relevance = filter({ sort: "relevance" });
    expect(relevance[0].promoted).toBe(true);
    expect(relevance[1].promoted).toBe(true);
  });
});
