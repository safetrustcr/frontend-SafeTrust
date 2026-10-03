import { notFound } from "next/navigation";
import { APARTMENT_LISTINGS } from "@/lib/mockData/apartmentListings";
import HotelDetailClient from "./HotelDetailClient";

export default async function HotelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hotel = APARTMENT_LISTINGS.find((apartment) => apartment.id === id);
  if (!hotel) notFound();

  return <HotelDetailClient hotel={hotel} />;
}
