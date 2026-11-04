import { notFound } from "next/navigation";
import { getListing } from "@/features/listings";
import HotelDetailClient from "./HotelDetailClient";

export default async function HotelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hotel = getListing(id);
  if (!hotel) notFound();

  return <HotelDetailClient hotel={hotel} />;
}
