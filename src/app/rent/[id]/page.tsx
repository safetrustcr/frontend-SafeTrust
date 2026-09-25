"use client";

import {
  LazyApartmentDetail,
  LazyHotelHeader,
  LazySuggestionsList,
} from "@/components/hotel/lazy";
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
      <LazyHotelHeader />

      <div className="mx-auto flex max-w-[1180px] flex-col lg:flex-row">
        <LazySuggestionsList
          apartments={suggestions}
          onSelect={(id) => router.push(`/rent/${id}`)}
        />
        <LazyApartmentDetail
          apartment={apartment}
          onBook={() => router.push(`/rent/${apartment.id}/escrow/create`)}
        />
      </div>
    </div>
  );
}
