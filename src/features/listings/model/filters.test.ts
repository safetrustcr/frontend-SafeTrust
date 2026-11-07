import { APARTMENT_LISTINGS } from "../data/demo-listings";
import { applyRentFilters } from "./filters";
import {
  DEFAULT_FILTERS,
  PRICE_BOUNDS,
  describeLocations,
  filterFacets,
  parseFilters,
  type RentFilters,
} from "../model/filters";
import type { Listing } from "./types";

describe("parseFilters", () => {
  it("uses all listings and broad price bounds by default", () => {
    expect(parseFilters(new URLSearchParams())).toEqual(DEFAULT_FILTERS);
  });

  it("parses valid filter params", () => {
    expect(
      parseFilters(
        new URLSearchParams(
          "categories=Family,Travelers&location=Heredia&bedrooms=2&min=50&max=150&sort=price-low",
        ),
      ),
    ).toEqual({
      categories: ["Family", "Travelers"],
      locations: ["Heredia"],
      bedrooms: "2",
      minPrice: 50,
      maxPrice: 150,
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
    expect(parseFilters(new URLSearchParams("min=150&max=50"))).toEqual(
      DEFAULT_FILTERS,
    );
  });

  it("clamps an out-of-range price bound without discarding the valid bound", () => {
    expect(
      parseFilters(new URLSearchParams("min=50&max=300000")),
    ).toMatchObject({
      minPrice: 50,
      maxPrice: PRICE_BOUNDS.max,
    });
    expect(
      parseFilters(new URLSearchParams("min=-1000&max=150")),
    ).toMatchObject({
      minPrice: PRICE_BOUNDS.min,
      maxPrice: 150,
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
      filter({ categories: ["Travelers"] })
        .map((item) => item.id)
        .sort(),
    ).toEqual(["11", "3", "6", "9"]);
  });

  it("filters by location", () => {
    expect(filter({ locations: ["Heredia"] }).map((item) => item.id)).toEqual([
      "4",
      "5",
    ]);
  });

  it("filters by bedroom count", () => {
    expect(
      filter({ bedrooms: "1" })
        .map((item) => item.id)
        .sort(),
    ).toEqual(["12", "2", "3", "9"]);
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
      filter({ minPrice: 59, maxPrice: 64 }).map((item) => item.price),
    ).toEqual([59, 64]);
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

describe("several provinces", () => {
  it("reads one province from location and several from locations", () => {
    expect(
      parseFilters(new URLSearchParams("location=Heredia")).locations,
    ).toEqual(["Heredia"]);
    expect(
      parseFilters(new URLSearchParams("locations=Heredia,Cartago,Nowhere"))
        .locations,
    ).toEqual(["Heredia", "Cartago"]);
  });

  it("describes them as a phrase", () => {
    expect(describeLocations([])).toBe("all destinations");
    expect(describeLocations(["Heredia"])).toBe("Heredia");
    expect(describeLocations(["San José", "Heredia"])).toBe(
      "San José and Heredia",
    );
  });
});

describe("filterFacets", () => {
  const listing = (location: string, category: string, price: number) =>
    ({ location, category, price, bedrooms: 1, promoted: false }) as Listing;
  const items = [
    listing("Heredia", "Family", 40),
    listing("Heredia", "Students", 200),
    listing("Cartago", "Family", 60),
  ];

  it("counts an option as if only the other filters applied", () => {
    const facets = filterFacets(items, {
      ...DEFAULT_FILTERS,
      locations: ["Heredia"],
    });

    expect(facets.locations).toEqual({ Heredia: 2, Cartago: 1 });
    expect(facets.categories).toEqual({ Family: 1, Students: 1 });
  });

  it("counts locations from their own listings when given", () => {
    const anyPlace = [...items, listing("Cartago", "Students", 90)];
    const facets = filterFacets(items, DEFAULT_FILTERS, anyPlace);

    expect(facets.locations).toEqual({ Heredia: 2, Cartago: 2 });
    expect(facets.categories).toEqual({ Family: 2, Students: 1 });
  });

  it("keeps the price spread whatever the price filter", () => {
    const { priceHistogram } = filterFacets(items, {
      ...DEFAULT_FILTERS,
      minPrice: 190,
    });

    expect(priceHistogram.reduce((sum, count) => sum + count, 0)).toBe(3);
    expect(priceHistogram.at(-1)).toBe(1); // the top bound stays in the last bin
  });
});
