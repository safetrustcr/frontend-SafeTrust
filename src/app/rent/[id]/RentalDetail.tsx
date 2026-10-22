"use client";

import type { ApartmentListing } from "@/types/hotel";
import {
  ApartmentDetail,
  HotelHeader,
  SuggestionsList,
} from "@/components/listings";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layouts/PageContainer";
import { WishlistAnnouncer, useSaveStay } from "@/features/listings";

export default function RentalDetail({
  apartment,
  suggestions,
}: {
  apartment: ApartmentListing;
  suggestions: ApartmentListing[];
}) {
  const router = useRouter();
  const { isSaved, toggleSaved, announcement } = useSaveStay();

  return (
    <div className="theme-guest min-h-screen bg-white">
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
          isSaved={isSaved(apartment.id)}
          onToggleSaved={() => toggleSaved(apartment.id)}
          onBook={() => router.push(`/rent/${apartment.id}/book`)}
        />
      </PageContainer>
    </div>
  );
}
