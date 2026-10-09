import { notFound } from "next/navigation";
import RentalDetail from "./RentalDetail";
import {
  APARTMENT_LISTINGS,
  getSuggestedApartments,
} from "@/lib/mockData/apartmentListings";

// Listings are static mock data: pre-render each one and let unknown ids 404
// at routing time. A notFound() thrown inside the loading.tsx Suspense
// boundary would otherwise be streamed with a 200 status.
export const dynamicParams = false;

export function generateStaticParams() {
  return APARTMENT_LISTINGS.map((listing) => ({ id: listing.id }));
}

export default async function RentalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const apartment = APARTMENT_LISTINGS.find((listing) => listing.id === id);

  // Unknown ids must 404, not silently show another listing.
  if (!apartment) notFound();

  const suggestions = getSuggestedApartments(apartment.id);

  return <RentalDetail apartment={apartment} suggestions={suggestions} />;
}