import { notFound } from "next/navigation";
import { getListing } from "@/features/listings";
import HotelBookClient from "./HotelBookClient";

export default async function HotelBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hotel = getListing(id);
  if (!hotel) notFound();

  return <HotelBookClient hotel={hotel} />;
}
