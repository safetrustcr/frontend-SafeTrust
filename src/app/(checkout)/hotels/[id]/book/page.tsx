import { notFound } from "next/navigation";
import { APARTMENT_LISTINGS } from "@/lib/mockData/apartmentListings";
import HotelBookClient from "./HotelBookClient";

export default async function HotelBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hotel = APARTMENT_LISTINGS.find((apartment) => apartment.id === id);
  if (!hotel) notFound();

  return <HotelBookClient hotel={hotel} />;
}
