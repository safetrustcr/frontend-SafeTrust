/**
 * Rent filters: the one implementation behind /rent, /guest/suggestions and
 * the guest dashboard. Pure, so it runs on the server and in tests.
 */
import {
  LISTING_CATEGORIES,
  LISTING_LOCATIONS,
  type Category,
  type Listing,
  type Location,
} from "./types";

export { LISTING_CATEGORIES, LISTING_LOCATIONS };
export type { Category, Location };

/** Nightly USD. Keep max ≥ the most expensive demo listing (enforced by a test). */
export const PRICE_BOUNDS = { min: 0, max: 200, step: 5 } as const;
export type SortOption = "relevance" | "price-low" | "price-high" | "nearest";
export type BedroomCount = "all" | "1" | "2" | "3";

export const BEDROOM_FILTERS = [
  { label: "All apartments", value: "all" },
  { label: "1 bedroom", value: "1" },
  { label: "2 bedrooms", value: "2" },
  { label: "3 bedrooms", value: "3" },
] as const satisfies readonly { label: string; value: BedroomCount }[];

export type RentFilters = {
  categories: Category[];
  locations: Location[];
  bedrooms: BedroomCount;
  minPrice: number;
  maxPrice: number;
  sort: SortOption;
};

export const DEFAULT_FILTERS: RentFilters = {
  categories: [],
  locations: [],
  bedrooms: "all",
  minPrice: PRICE_BOUNDS.min,
  maxPrice: PRICE_BOUNDS.max,
  sort: "relevance",
};

/**
 * Query keys owned by the filters (the stay search owns the rest). One province
 * is `location`, which a stay search place depends on; two or more are
 * `locations`, so `location` always names exactly one province.
 */
export const FILTER_PARAM_KEYS = [
  "categories",
  "location",
  "locations",
  "bedrooms",
  "min",
  "max",
  "sort",
] as const;

export function resolveSortOption(
  sort: SortOption,
  canSortByDistance: boolean,
): SortOption {
  return sort === "nearest" && !canSortByDistance ? "relevance" : sort;
}

const isCategory = (value: string): value is Category =>
  (LISTING_CATEGORIES as readonly string[]).includes(value);
const isLocation = (value: string): value is Location =>
  (LISTING_LOCATIONS as readonly string[]).includes(value);

export function parseFilters(params: URLSearchParams): RentFilters {
  const numberParam = (key: string, fallback: number) => {
    const value = Number(params.get(key));
    return params.has(key) && Number.isFinite(value) ? value : fallback;
  };
  const rawLocations = [
    ...(params.get("location")?.split(",") ?? []),
    ...(params.get("locations")?.split(",") ?? []),
  ];
  const rawSort = params.get("sort");
  const rawBedrooms = params.get("bedrooms");
  let minPrice = numberParam("min", DEFAULT_FILTERS.minPrice);
  let maxPrice = numberParam("max", DEFAULT_FILTERS.maxPrice);
  minPrice = Math.max(PRICE_BOUNDS.min, Math.min(minPrice, PRICE_BOUNDS.max));
  maxPrice = Math.max(PRICE_BOUNDS.min, Math.min(maxPrice, PRICE_BOUNDS.max));
  if (minPrice > maxPrice) {
    minPrice = DEFAULT_FILTERS.minPrice;
    maxPrice = DEFAULT_FILTERS.maxPrice;
  }

  return {
    categories: (params.get("categories")?.split(",") ?? []).filter(isCategory),
    locations: [...new Set(rawLocations)].filter(isLocation),
    bedrooms:
      rawBedrooms === "1" || rawBedrooms === "2" || rawBedrooms === "3"
        ? rawBedrooms
        : "all",
    minPrice,
    maxPrice,
    sort:
      rawSort === "price-low" ||
      rawSort === "price-high" ||
      rawSort === "nearest"
        ? rawSort
        : "relevance",
  };
}

export function applyRentFilters(
  items: Listing[],
  filters: RentFilters,
): Listing[] {
  const results = items.filter(
    (apartment) =>
      (filters.categories.length === 0 ||
        filters.categories.includes(apartment.category)) &&
      (filters.locations.length === 0 ||
        filters.locations.includes(apartment.location)) &&
      (filters.bedrooms === "all" ||
        (filters.bedrooms === "3"
          ? apartment.bedrooms >= 3
          : apartment.bedrooms === Number(filters.bedrooms))) &&
      apartment.price >= filters.minPrice &&
      apartment.price <= filters.maxPrice,
  );

  if (filters.sort === "price-low") {
    return results.sort((left, right) => left.price - right.price);
  }
  if (filters.sort === "price-high") {
    return results.sort((left, right) => right.price - left.price);
  }
  return results.sort(
    (left, right) => Number(right.promoted) - Number(left.promoted),
  );
}

const PRICE_HISTOGRAM_BINS = 10;

/** Listings per equal-width bin across `PRICE_BOUNDS`. */
function priceHistogram(prices: number[]): number[] {
  const bins = new Array<number>(PRICE_HISTOGRAM_BINS).fill(0);
  const width = (PRICE_BOUNDS.max - PRICE_BOUNDS.min) / PRICE_HISTOGRAM_BINS;
  for (const price of prices) {
    const bin = Math.floor((price - PRICE_BOUNDS.min) / width);
    bins[Math.max(0, Math.min(bin, PRICE_HISTOGRAM_BINS - 1))] += 1;
  }
  return bins;
}

/**
 * What each filter option would show. A facet ignores its own selection, so a
 * count answers "how many stays if I tick this" given every other filter.
 */
export function filterFacets(items: Listing[], filters: RentFilters) {
  const tally = (values: string[]) =>
    values.reduce<Record<string, number>>((counts, value) => {
      counts[value] = (counts[value] ?? 0) + 1;
      return counts;
    }, {});

  return {
    categories: tally(
      applyRentFilters(items, { ...filters, categories: [] }).map(
        (item) => item.category,
      ),
    ),
    locations: tally(
      applyRentFilters(items, { ...filters, locations: [] }).map(
        (item) => item.location,
      ),
    ),
    priceHistogram: priceHistogram(
      applyRentFilters(items, {
        ...filters,
        minPrice: PRICE_BOUNDS.min,
        maxPrice: PRICE_BOUNDS.max,
      }).map((item) => item.price),
    ),
  };
}

/** The selected provinces as a phrase, e.g. "San José and Heredia". */
export function describeLocations(locations: readonly Location[]): string {
  return locations.length
    ? new Intl.ListFormat("en", { type: "conjunction" }).format(locations)
    : "all destinations";
}
