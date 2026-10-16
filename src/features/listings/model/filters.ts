import {
  APARTMENT_CATEGORIES,
  APARTMENT_LOCATIONS,
} from "@/lib/mockData/apartmentListings";

export const PRICE_BOUNDS = { min: 0, max: 250_000 } as const;
export type SortOption = "relevance" | "price-low" | "price-high" | "nearest";
export type Category = (typeof APARTMENT_CATEGORIES)[number];
export type Location = (typeof APARTMENT_LOCATIONS)[number];
export type BedroomCount = "all" | "1" | "2" | "3";

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
