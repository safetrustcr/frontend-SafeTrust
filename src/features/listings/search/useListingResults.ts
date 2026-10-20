"use client";

import { useMemo } from "react";
import { applyRentFilters } from "@/components/listings/filters/applyRentFilters";
import { useRentFilters } from "@/components/listings/filters/useRentFilters";
import type { RentFilters } from "@/components/listings/filters/useRentFilters";
import { normalizeSearchText } from "@/lib/text";
import { useStaySearch } from "./useStaySearch";
import type { ApartmentListing } from "@/types/hotel";

/** The shared URL-backed pipeline for rental listing results. */
export function useListingResults(
  listings: ApartmentListing[],
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
