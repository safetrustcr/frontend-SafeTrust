import { notFound } from "next/navigation";
import { getApartmentById } from "@/lib/mockData/apartmentListings";
import { RentBooking } from "@/features/escrow";

export default async function RentBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = getApartmentById(id);
  if (!listing) notFound();

  return <RentBooking listing={listing} />;
}
