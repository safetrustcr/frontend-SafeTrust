"use client";

import { Suspense, useMemo } from "react";
import type { ApartmentListing } from "@/types/hotel";
import {
  ApartmentDetail,
  HotelHeader,
  SuggestionsList,
} from "@/components/listings";
import { useRouter, useSearchParams } from "next/navigation";
import { PageContainer } from "@/components/layouts/PageContainer";
import type { BookingIntent } from "@/features/listings/detail/BookingSummaryBar";
import { WishlistAnnouncer, useSaveStay } from "@/features/listings";

function RentalDetailContent({
  apartment,
  suggestions,
}: {
  apartment: ApartmentListing;
  suggestions: ApartmentListing[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSaved, toggleSaved, announcement } = useSaveStay();

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
    const params = new URLSearchParams();
    if (intent.checkIn) params.set("checkIn", intent.checkIn);
    if (intent.checkOut) params.set("checkOut", intent.checkOut);
    if (intent.adults) {
      params.set("adults", intent.adults.toString());
      params.set("guests", intent.adults.toString());
    }

    const query = params.toString();
    router.push(
      query
        ? `/rent/${apartment.id}/book?${query}`
        : `/rent/${apartment.id}/book`,
    );
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
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      adults: adults.toString(),
      guests: adults.toString(),
    });
    router.push(`/rent/${apartment.id}/book?${params.toString()}`);
  };

  return (
    <div className="theme-guest min-h-screen bg-background text-foreground">
      <HotelHeader />
      <WishlistAnnouncer message={announcement} />
      <PageContainer className="flex flex-col lg:flex-row">
        <SuggestionsList
          apartments={suggestions}
          isSaved={isSaved}
          onToggleSaved={toggleSaved}
          onSelect={(id) => router.push(`/rent/${id}`)}
        />
        <ApartmentDetail
          apartment={apartment}
          intent={intent}
          onBook={handleBook}
          onBookExact={handleBookExact}
          isSaved={isSaved(apartment.id)}
          onToggleSaved={() => toggleSaved(apartment.id)}
        />
      </PageContainer>
    </div>
  );
}

export default function RentalDetail(props: {
  apartment: ApartmentListing;
  suggestions: ApartmentListing[];
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <RentalDetailContent {...props} />
    </Suspense>
  );
}
