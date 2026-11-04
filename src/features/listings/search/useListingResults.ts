"use client";

import { useMemo } from "react";
import { applyRentFilters } from "../model/filters";
import { useRentFilters } from "../hooks/useRentFilters";
import type { RentFilters } from "../model/filters";
import { normalizeSearchText } from "@/lib/text";
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
  const query = normalizeSearchText(search.q);

  return useMemo(
    () =>
      applyRentFilters(listings, filters).filter(
        (listing) =>
          !query ||
          normalizeSearchText(`${listing.name} ${listing.address}`).includes(
            query,
          ),
      ),
    [filters, listings, query],
  );
}
