"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  APARTMENT_CATEGORIES,
  APARTMENT_LOCATIONS,
} from "@/lib/mockData/apartmentListings";
import {
  localToday,
  parseStaySearch,
  writeStaySearch,
} from "@/features/listings";

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
    requests: Set<string>;
  } | null>(null);

  useEffect(() => {
    const pending = pendingFilters.current;
    // Keep the latest intent while earlier router transitions commit. A
    // different URL (e.g. browser Back) restores the URL as the source of truth.
    if (
      pending &&
      (pending.params === paramsString || !pending.requests.has(paramsString))
    ) {
      pendingFilters.current = null;
    }
  }, [paramsString]);

  const setFilters = useCallback(
    (
      patch:
        Partial<RentFilters> | ((current: RentFilters) => Partial<RentFilters>),
    ) => {
      const baseFilters = pendingFilters.current?.filters ?? filters;
      const next = {
        ...baseFilters,
        ...(typeof patch === "function" ? patch(baseFilters) : patch),
      };
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

      // Keep the stay search (q, place, guests, dates) intact while filters
      // change. A pending reset has params "" so "Clear all" still wipes it;
      // parse re-validates and writeStaySearch rewrites it canonically.
      const searchSource = pendingFilters.current?.params ?? paramsString;
      writeStaySearch(
        parseStaySearch(new URLSearchParams(searchSource), localToday()),
        query,
      );

      const queryString = query.toString();
      const requests = pendingFilters.current?.requests ?? new Set<string>();
      requests.add(queryString);
      pendingFilters.current = { params: queryString, filters: next, requests };
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [filters, paramsString, pathname, router],
  );

  const reset = useCallback(() => {
    const requests = pendingFilters.current?.requests ?? new Set<string>();
    requests.add("");
    pendingFilters.current = { params: "", filters: DEFAULT_FILTERS, requests };
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

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
