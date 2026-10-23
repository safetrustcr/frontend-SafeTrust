"use client";

import { useRef, useEffect } from "react";
import type { GeoPoint } from "@/types/destination";
import type { RentFilters } from "@/components/listings/filters/useRentFilters";

/** When the user grants location, switch to Nearest only if they hadn't chosen a sort. Never rewrites the URL otherwise. */
export function useNearestOnGrant(
  position: GeoPoint | null,
  outside: boolean,
  filters: RentFilters,
  setFilters: (p: Partial<RentFilters>) => void,
) {
  const previous = useRef<GeoPoint | null>(position);
  useEffect(() => {
    if (!position || previous.current === position) {
      previous.current = position;
      return;
    }
    previous.current = position;
    if (!outside && filters.sort === "relevance")
      setFilters({ sort: "nearest" });
  }, [position, outside, filters.sort, setFilters]);
}
