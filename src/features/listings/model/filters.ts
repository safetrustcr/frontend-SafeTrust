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
  location: Location | null;
  bedrooms: BedroomCount;
  minPrice: number;
  maxPrice: number;
  sort: SortOption;
};

export const DEFAULT_FILTERS: RentFilters = {
  categories: [],
  location: null,
  bedrooms: "all",
  minPrice: PRICE_BOUNDS.min,
  maxPrice: PRICE_BOUNDS.max,
  sort: "relevance",
};

/** Query keys owned by the filters (the stay search owns the rest). */
export const FILTER_PARAM_KEYS = [
  "categories",
  "location",
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
  const rawLocation = params.get("location");
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
    location: rawLocation && isLocation(rawLocation) ? rawLocation : null,
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
      (filters.location === null || apartment.location === filters.location) &&
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
