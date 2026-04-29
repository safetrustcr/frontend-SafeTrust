"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
// import { useSuspenseQuery } from "@apollo/client";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertySummaryHeader } from "@/components/dashboard/apartments/PropertySummaryHeader";
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

  const mappedOffers: RentalOffer[] = offers.map((offer: any) => ({
    id: offer.id,
    tenant_name: offer.tenant_name,
    tenant_phone: offer.tenant_phone,
    tenant_wallet_address: offer.tenant_wallet_address,
    offer_date: offer.offer_date,
    bid_status: offer.bid_status,
  }));

  return (
    <div className="space-y-6">
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

      <PropertySummaryHeader
        name={apartment.name}
        address={apartment.address || apartment.location}
        bedrooms={apartment.bedrooms || 0}
        bathrooms={apartment.bathrooms || 0}
        price={apartment.price}
      />

      <InterestedPeopleTable
        offers={mappedOffers}
        totalCount={totalCount}
        isLoading={offersLoading}
      />
    </div>
  );
}
