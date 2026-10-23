import type { ApartmentListing } from "@/types/hotel";
import type { GeoPoint } from "@/types/destination";
import { applyRentFilters } from "@/components/listings/filters/applyRentFilters";
import {
  resolveSortOption,
  type RentFilters,
} from "@/components/listings/filters/useRentFilters";
import { distanceKm, sortByDistance } from "@/lib/geo";

export const OUTSIDE_COSTA_RICA_KM = 300;

export const normalizeSearchText = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase();

export function isOutsideCostaRica(
  position: GeoPoint | null,
  listings: readonly ApartmentListing[],
) {
  if (!position || listings.length === 0) return false;
  return (
    Math.min(...listings.map((l) => distanceKm(position, l.coordinates))) >
    OUTSIDE_COSTA_RICA_KM
  );
}

export function selectRentResults(input: {
  listings: readonly ApartmentListing[];
  filters: RentFilters;
  query: string;
  position: GeoPoint | null;
}) {
  const outside = isOutsideCostaRica(input.position, input.listings);
  const canSortByDistance = !!input.position && !outside;
  const sort = resolveSortOption(input.filters.sort, canSortByDistance);
  const q = normalizeSearchText(input.query);
  let results = applyRentFilters([...input.listings], {
    ...input.filters,
    sort,
  }).filter(
    (l) => !q || normalizeSearchText(`${l.name} ${l.address}`).includes(q),
  );
  if (sort === "nearest" && input.position) {
    results = sortByDistance(results, input.position, (l) => l.coordinates);
  }
  const distances = input.position
    ? Object.fromEntries(
        input.listings.map((l) => [
          l.id,
          distanceKm(input.position!, l.coordinates),
        ]),
      )
    : undefined;
  return { results, sort, canSortByDistance, outside, distances };
}
