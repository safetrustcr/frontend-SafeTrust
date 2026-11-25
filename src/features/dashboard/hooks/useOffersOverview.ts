"use client";

import { MOCK_APARTMENTS } from "@/lib/mockData/apartments";
import { MOCK_RENTAL_OFFERS } from "@/lib/mockData/offers";

export type OfferSummary = {
  apartmentId: string;
  name: string;
  address: string;
  offers: number;
  newest?: string;
};

/**
 * Demo: derived from the mock owner's apartments and rental offers.
 * IC-17 replaces this body with the owner-scoped Hasura query; IC-08 enforces
 * ownership on the backend, rather than through client-side filtering.
 */
export function useOffersOverview(): {
  data: OfferSummary[];
  loading: boolean;
  error: Error | null;
} {
  return {
    data: MOCK_APARTMENTS.map((apartment) => ({
      apartmentId: apartment.id,
      name: apartment.name,
      address:
        [apartment.address.street, apartment.address.city]
          .filter(Boolean)
          .join(", ") || apartment.location,
      offers: (MOCK_RENTAL_OFFERS[apartment.id] ?? []).length,
    })),
    loading: false,
    error: null,
  };
}
