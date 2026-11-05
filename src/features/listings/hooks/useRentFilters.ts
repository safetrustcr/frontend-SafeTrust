"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_FILTERS,
  FILTER_PARAM_KEYS,
  parseFilters,
  type RentFilters,
} from "../model/filters";
import { localToday } from "../search/date-only";
import { parseStaySearch, writeStaySearch } from "../search/stay-search";

/** Rewrites the stay search in `query`, re-validated against its filters. */
const keepStaySearch = (query: URLSearchParams) =>
  writeStaySearch(
    parseStaySearch(new URLSearchParams(query), localToday()),
    query,
  );

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
      const query = new URLSearchParams(
        pendingFilters.current?.params ?? paramsString,
      );
      for (const key of FILTER_PARAM_KEYS) query.delete(key);
      if (next.categories.length) {
        query.set("categories", next.categories.join(","));
      } else {
        query.delete("categories");
      }
      if (next.location) query.set("location", next.location);
      else query.delete("location");
      if (next.bedrooms !== "all") query.set("bedrooms", next.bedrooms);
      else query.delete("bedrooms");
      if (next.minPrice !== DEFAULT_FILTERS.minPrice) {
        query.set("min", String(next.minPrice));
      } else {
        query.delete("min");
      }
      if (next.maxPrice !== DEFAULT_FILTERS.maxPrice) {
        query.set("max", String(next.maxPrice));
      } else {
        query.delete("max");
      }
      if (next.sort !== "relevance") query.set("sort", next.sort);
      else query.delete("sort");

      // Keep the stay search (q, place, guests, dates) while filters change.
      // A pending reset has params "" so "Clear all" still wipes it. Parsing
      // against the new location drops a place outside the new province.
      keepStaySearch(query);

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
    const query = new URLSearchParams(
      pendingFilters.current?.params ?? paramsString,
    );
    for (const key of FILTER_PARAM_KEYS) query.delete(key);
    query.delete("place"); // a place needs its province, which reset removes
    const queryString = query.toString();
    const requests = pendingFilters.current?.requests ?? new Set<string>();
    requests.add(queryString);
    pendingFilters.current = {
      params: queryString,
      filters: DEFAULT_FILTERS,
      requests,
    };
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
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
