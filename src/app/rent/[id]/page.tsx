"use client";

import {
  ApartmentDetail,
  HotelHeader,
  SuggestionsList,
} from "@/components/listings";
import { getHotelById, getSuggestedHotels } from "@/lib/mockData/hotels";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function HotelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const apartment = getHotelById(resolvedParams.id);
  const suggestions = getSuggestedHotels(apartment.id);

  return (
    <div className="min-h-screen bg-white">
      <HotelHeader />

      <div className="mx-auto flex max-w-[1180px] flex-col lg:flex-row">
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
