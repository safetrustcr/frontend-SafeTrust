"use client";

import { useMemo } from "react";
import type { ApartmentListing } from "@/types/hotel";
import {
  ApartmentDetail,
  HotelHeader,
  SuggestionsList,
} from "@/components/listings";
import { useRouter, useSearchParams } from "next/navigation";
import { PageContainer } from "@/components/layouts/PageContainer";
import { listingHref } from "@/features/listings/search/links";
import type { BookingIntent } from "@/features/listings/detail/BookingSummaryBar";

function RentalDetailContent({
  apartment,
  suggestions,
}: {
  apartment: ApartmentListing;
  suggestions: ApartmentListing[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingSearchParams = searchParams.toString();
  const currentSearch = new URLSearchParams(listingSearchParams);

  const intent: BookingIntent = useMemo(() => {
    const checkIn = searchParams.get("checkIn") || undefined;
    const checkOut = searchParams.get("checkOut") || undefined;
    const adultsParam =
      searchParams.get("adults") || searchParams.get("guests");
    const adults = adultsParam ? parseInt(adultsParam, 10) : undefined;
    const isFlexible =
      searchParams.get("dates") === "flexible" ||
      searchParams.get("flexible") === "true";
    const flexibleLabel = searchParams.get("flexibleLabel") || undefined;

    return {
      checkIn,
      checkOut,
      adults: adults && !isNaN(adults) ? adults : undefined,
      isFlexible,
      flexibleLabel,
    };
  }, [searchParams]);

  const handleBook = () => {
    const params = new URLSearchParams(currentSearch);
    if (intent.checkIn) params.set("checkIn", intent.checkIn);
    if (intent.checkOut) params.set("checkOut", intent.checkOut);
    if (intent.adults) {
      params.set("adults", intent.adults.toString());
      params.set("guests", intent.adults.toString());
    }

    router.push(listingHref(`/rent/${apartment.id}/escrow/create`, params));
  };

  const handleBookExact = ({
    checkIn,
    checkOut,
    adults,
  }: {
    checkIn: string;
    checkOut: string;
    adults: number;
  }) => {
    const params = new URLSearchParams(currentSearch);
    for (const key of ["stay", "months", "flex", "dates", "flexible"]) {
      params.delete(key);
    }
    params.set("checkIn", checkIn);
    params.set("checkOut", checkOut);
    params.set("adults", adults.toString());
    params.set("guests", adults.toString());
    router.push(listingHref(`/rent/${apartment.id}/escrow/create`, params));
  };

  return (
    <div className="min-h-screen bg-white">
      <HotelHeader listingSearchParams={listingSearchParams} />
      <PageContainer className="flex flex-col lg:flex-row">
        <SuggestionsList
          apartments={suggestions}
          onSelect={(id) =>
            router.push(listingHref(`/rent/${id}`, currentSearch))
          }
        />
        <ApartmentDetail
          apartment={apartment}
          intent={intent}
          onBook={handleBook}
          onBookExact={handleBookExact}
        />
      </PageContainer>
    </div>
  );
}

export default function RentalDetail(props: {
  apartment: ApartmentListing;
  suggestions: ApartmentListing[];
}) {
  return <RentalDetailContent {...props} />;
}
