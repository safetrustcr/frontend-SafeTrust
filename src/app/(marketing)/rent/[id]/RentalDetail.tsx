"use client";

import type { ApartmentListing } from "@/types/hotel";
import {
  ApartmentDetail,
  HotelHeader,
  SuggestionsList,
} from "@/components/listings";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layouts/PageContainer";

export default function RentalDetail({
  apartment,
  suggestions,
}: {
  apartment: ApartmentListing;
  suggestions: ApartmentListing[];
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <HotelHeader />
      <PageContainer className="flex flex-col lg:flex-row">
        <SuggestionsList
          apartments={suggestions}
          onSelect={(id) => router.push(`/rent/${id}`)}
        />
        <ApartmentDetail
          apartment={apartment}
          onBook={() => router.push(`/rent/${apartment.id}/escrow/create`)}
        />
      </PageContainer>
    </div>
  );
}
