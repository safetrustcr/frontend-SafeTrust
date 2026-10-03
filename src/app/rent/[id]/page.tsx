"use client";

import {
  ApartmentDetail,
  HotelHeader,
  SuggestionsList,
} from "@/components/listings";
import {
  getApartmentById,
  getSuggestedApartments,
} from "@/lib/mockData/apartmentListings";
import { useRouter } from "next/navigation";
import { use } from "react";

/** Render the selected rental detail and related suggestions. */
export default function HotelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const apartment = getApartmentById(resolvedParams.id);
  const suggestions = getSuggestedApartments(apartment.id);

  return (
    <div className="min-h-screen bg-white">
      <HotelHeader />

      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-6 lg:flex-row lg:px-8">
        <SuggestionsList
          apartments={suggestions}
          onSelect={(id) => router.push(`/rent/${id}`)}
        />
        <ApartmentDetail
          apartment={apartment}
          onBook={() => router.push(`/rent/${apartment.id}/escrow/create`)}
        />
      </div>
    </div>
  );
}
