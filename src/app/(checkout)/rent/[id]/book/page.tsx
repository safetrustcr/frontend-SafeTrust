import { notFound } from "next/navigation";
import { getListing } from "@/features/listings";
import {
  demoReadinessFromQuery,
  RentBooking,
  type FeeOption,
} from "@/features/escrow";

export default async function RentBookPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const listing = getListing(id);
  if (!listing) notFound();

  const singleValue = (value: string | string[] | undefined) =>
    typeof value === "string" ? value : undefined;
  const guestCount = Number(
    singleValue(query.adults) ?? singleValue(query.guests),
  );
  const rawFeeOption = singleValue(query.feeOption);
  const feeOption: FeeOption | undefined =
    rawFeeOption === "host" || rawFeeOption === "guest"
      ? rawFeeOption
      : undefined;
  // Demo only: ?readiness=<preset> previews the wallet readiness checklist.
  const demoReadiness = demoReadinessFromQuery(singleValue(query.readiness));

  return (
    <RentBooking
      listing={listing}
      initialCheckIn={singleValue(query.checkIn)}
      initialCheckOut={singleValue(query.checkOut)}
      initialGuestCount={Number.isFinite(guestCount) ? guestCount : undefined}
      feeOption={feeOption}
      demoReadiness={demoReadiness}
    />
  );
}
