import { notFound } from "next/navigation";
import { getApartmentById } from "@/lib/mockData/apartmentListings";
import { RentBooking } from "@/features/escrow";

export default async function RentBookPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const listing = getApartmentById(id);
  if (!listing) notFound();

  const singleValue = (value: string | string[] | undefined) =>
    typeof value === "string" ? value : undefined;
  const guestCount = Number(
    singleValue(query.adults) ?? singleValue(query.guests),
  );

  return (
    <RentBooking
      listing={listing}
      initialCheckIn={singleValue(query.checkIn)}
      initialCheckOut={singleValue(query.checkOut)}
      initialGuestCount={Number.isFinite(guestCount) ? guestCount : undefined}
    />
  );
}
