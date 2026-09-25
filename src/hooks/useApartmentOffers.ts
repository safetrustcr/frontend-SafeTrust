"use client";

import { MOCK_APARTMENTS, type Apartment } from "@/lib/mockData/apartments";
import { MOCK_RENTAL_OFFERS } from "@/lib/mockData/offers";
import type { RentalOffer } from "@/components/dashboard/apartments/InterestedPeopleTable";

type Result = {
  data: { apartment: Apartment | null; offers: RentalOffer[]; totalCount: number };
  loading: boolean;
  error: Error | null;
};

/** Skeleton mock, same shape as Apollo useQuery. Swap the body in dApp-SafeTrust. */
export function useApartmentOffers(apartmentId: number): Result {
  const apartment = MOCK_APARTMENTS.find((item) => Number(item.id) === apartmentId) ?? null;
  const offers = MOCK_RENTAL_OFFERS[apartmentId] ?? [];
  return { data: { apartment, offers, totalCount: offers.length }, loading: false, error: null };
}
