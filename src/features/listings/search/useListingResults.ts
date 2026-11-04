"use client";

import { useMemo } from "react";
import { applyRentFilters } from "../model/filters";
import { useRentFilters } from "../hooks/useRentFilters";
import type { RentFilters } from "../model/filters";
import { applyStaySearch, matchesQuery } from "./match-stay";
import { useStaySearch } from "./useStaySearch";
import type { Listing } from "../model/types";

/** The shared URL-backed pipeline for rental listing results. */
export function useListingResults(
  listings: Listing[],
  filterOverrides?: RentFilters,
) {
  const { filters: urlFilters } = useRentFilters();
  const { search, today } = useStaySearch();
  const filters = filterOverrides ?? urlFilters;

  return useMemo(
    () =>
      applyStaySearch(
        applyRentFilters(listings, filters).filter((listing) =>
          matchesQuery(listing, search.q),
        ),
        search,
        today,
      ),
    [filters, listings, search, today],
  );
}
