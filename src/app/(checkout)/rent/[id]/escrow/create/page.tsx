import { notFound } from "next/navigation";
import { RentCheckout } from "@/features/escrow";
import { APARTMENT_LISTINGS } from "@/lib/mockData/apartmentListings";

export default async function EscrowCreatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = APARTMENT_LISTINGS.find((apartment) => apartment.id === id);

  if (!listing) notFound();

  return <RentCheckout listing={listing} />;
}
