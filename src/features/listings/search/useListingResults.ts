"use client";

import { useMemo } from "react";
import { applyRentFilters } from "../model/filters";
import { useRentFilters } from "../hooks/useRentFilters";
import type { RentFilters } from "../model/filters";
import { matchesQuery } from "./match-stay";
import { useStaySearch } from "./useStaySearch";
import type { Listing } from "../model/types";

/** The shared URL-backed pipeline for rental listing results. */
export function useListingResults(
  listings: Listing[],
  filterOverrides?: RentFilters,
) {
  const { filters: urlFilters } = useRentFilters();
  const { search } = useStaySearch();
  const filters = filterOverrides ?? urlFilters;
  const { q, place } = search;

  // The place filter is also in applyStaySearch; it is repeated here so pages
  // that skip the stay search (/guest/suggestions) still honour ?place=.
  return useMemo(
    () =>
      applyRentFilters(listings, filters).filter(
        (listing) =>
          (place === null || listing.placeId === place) &&
          matchesQuery(listing, q),
      ),
    [filters, listings, place, q],
  );
}
