import { APARTMENT_LISTINGS } from "@/lib/mockData/apartmentListings";
import type { ApartmentListing } from "@/types/hotel";

/**
 * The apartment listings the public browsing page (`/rent`) shows.
 *
 * Exposed through the hook layer — the one place allowed to reach into
 * `@/lib/mockData` — so components never import mock data directly
 * (`no-restricted-imports` in `eslint.config.mjs`).
 */
export function useApartmentListings(): ApartmentListing[] {
  return APARTMENT_LISTINGS;
}
