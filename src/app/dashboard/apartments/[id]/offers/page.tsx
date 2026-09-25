"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
// import { useSuspenseQuery } from "@apollo/client";
import { ArrowLeft, MapPin, Bed, PawPrint, Bath } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InterestedPeopleTable } from "@/components/dashboard/apartments/InterestedPeopleTable";
// TODO: Uncomment after running `npm run codegen` with Hasura running
// import {
//   GET_APARTMENT_BY_ID,
//   GET_RENTAL_OFFERS,
// } from "@/graphql/queries/apartment-queries";
import type { RentalOffer } from "@/components/dashboard/apartments/InterestedPeopleTable";

export default function InterestedPeoplePage() {
  const params = useParams();
  const router = useRouter();
  const apartmentId = Number(params.id);

  // TODO: Replace with actual GraphQL queries once codegen is run
  // const { data: apartmentData } = useSuspenseQuery(GET_APARTMENT_BY_ID, {
  //   variables: { id: apartmentId },
  // });
  // const { data: offersData } = useSuspenseQuery(GET_RENTAL_OFFERS, {
  //   variables: { apartment_id: apartmentId, order_by: [{ offer_date: "desc" }] },
  // });

  // Temporary stub data until GraphQL is set up
  const apartmentData = {
    apartments_by_pk: {
      id: apartmentId,
      name: "La sabana house",
      location: "San José",
      address: "329 Calle Santos, Paseo Colón, San José",
      bedrooms: 2,
      bathrooms: 1,
      price: 4058.0,
      status: "not_inhabited",
      promoted: true,
    },
  };

  const offersData = {
    rental_offers: Array(10)
      .fill(null)
      .map((_, i) => ({
        id: i + 1,
        tenant_name: "Diego Duarte Fernández",
        tenant_phone: "+506 6483252",
        tenant_wallet_address: "XR6...32D",
        offer_date: new Date(2024, 8, 12 + i).toISOString(),
        bid_status: i === 1 ? "accepted" : i === 5 ? "rejected" : "pending",
      })),
    rental_offers_aggregate: { aggregate: { count: 10 } },
  };

  const apartmentLoading = false;
  const offersLoading = false;
  const apartmentError = null;
  const offersError = null;

  const apartment = apartmentData?.apartments_by_pk;
  const offers = offersData?.rental_offers || [];
  const totalCount =
    offersData?.rental_offers_aggregate?.aggregate?.count || 0;

  // Handle invalid apartment ID
  useEffect(() => {
    if (!apartmentId || isNaN(apartmentId)) {
      router.push("/dashboard/apartments");
    }
  }, [apartmentId, router]);

  // Handle apartment not found
  useEffect(() => {
    if (!apartmentLoading && !apartment && !apartmentError) {
      router.push("/dashboard/apartments");
    }
  }, [apartment, apartmentLoading, apartmentError, router]);

  if (apartmentLoading || offersLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (apartmentError || offersError) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/apartments")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to apartments
        </Button>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <p className="text-destructive">
            Error loading data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!apartment) {
    return null;
  }

  const mappedOffers: RentalOffer[] = offers.map((offer: { id: string; tenant_id?: string | null; tenant_name: string; tenant_phone: string; tenant_wallet_address: string }) => ({
    id: offer.id,
    tenant_id: offer.tenant_id ?? null,
    tenant_name: offer.tenant_name,
    tenant_phone: offer.tenant_phone,
    tenant_wallet_address: offer.tenant_wallet_address,
    offer_date: offer.offer_date,
    bid_status: offer.bid_status,
  }));

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/apartments")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-lg font-medium text-muted-foreground">
          Interested people
        </h2>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-2xl font-semibold text-gray-900 dark:text-white">
              <span className="text-orange-500">🔥</span>
              {apartment.name}
              <span className="font-normal text-gray-500 dark:text-gray-400">
                · Interested people
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-orange-500" />
                {apartment.address || apartment.location}
              </span>
              <span className="flex items-center gap-1">
                <Bed className="h-4 w-4 text-orange-500" />
                {apartment.bedrooms} bd.
              </span>
              {(apartment as { pet_friendly?: boolean }).pet_friendly !== false && (
                <span className="flex items-center gap-1">
                  <PawPrint className="h-4 w-4 text-orange-500" />
                  pet friendly
                </span>
              )}
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4 text-orange-500" />
                {apartment.bathrooms} ba.
              </span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-bold text-orange-500">
              {formatCurrency(apartment.price)}
            </p>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Per month
            </p>
          </div>
        </div>
      </div>

      <InterestedPeopleTable
        offers={mappedOffers}
        totalCount={totalCount}
        isLoading={offersLoading}
      />
    </div>
  );
}
