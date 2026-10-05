"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

export function resolveSortOption(
  sort: SortOption,
  canSortByDistance: boolean,
): SortOption {
  return sort === "nearest" && !canSortByDistance ? "relevance" : sort;
}

const isCategory = (value: string): value is Category =>
  (APARTMENT_CATEGORIES as readonly string[]).includes(value);
const isLocation = (value: string): value is Location =>
  (APARTMENT_LOCATIONS as readonly string[]).includes(value);

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

export function useRentFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const paramsString = params.toString();
  const filters = useMemo(
    () => parseFilters(new URLSearchParams(paramsString)),
    [paramsString],
  );
  const pendingFilters = useRef<{
    params: string;
    filters: RentFilters;
  } | null>(null);

  useEffect(() => {
    if (pendingFilters.current?.params !== paramsString) {
      pendingFilters.current = null;
    }
  }, [paramsString]);

  const setFilters = useCallback(
    (patch: Partial<RentFilters>) => {
      const baseFilters =
        pendingFilters.current?.params === paramsString
          ? pendingFilters.current.filters
          : filters;
      const next = { ...baseFilters, ...patch };
      const query = new URLSearchParams();
      if (next.categories.length) {
        query.set("categories", next.categories.join(","));
      }
      if (next.location) query.set("location", next.location);
      if (next.bedrooms !== "all") query.set("bedrooms", next.bedrooms);
      if (next.minPrice !== DEFAULT_FILTERS.minPrice) {
        query.set("min", String(next.minPrice));
      }
      if (next.maxPrice !== DEFAULT_FILTERS.maxPrice) {
        query.set("max", String(next.maxPrice));
      }
      if (next.sort !== "relevance") query.set("sort", next.sort);

      pendingFilters.current = { params: paramsString, filters: next };
      const queryString = query.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [filters, paramsString, pathname, router],
  );

  const reset = useCallback(() => {
    pendingFilters.current = { params: paramsString, filters: DEFAULT_FILTERS };
    router.replace(pathname, { scroll: false });
  }, [paramsString, pathname, router]);

  const activeCount =
    filters.categories.length +
    Number(filters.location !== null) +
    Number(filters.bedrooms !== "all") +
    Number(
      filters.minPrice !== DEFAULT_FILTERS.minPrice ||
        filters.maxPrice !== DEFAULT_FILTERS.maxPrice,
    );

  return { filters, setFilters, reset, activeCount };
}
