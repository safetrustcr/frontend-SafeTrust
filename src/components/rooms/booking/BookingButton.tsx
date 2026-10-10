"use client";

import * as React from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { useWallet } from "@/components/auth/wallet/hooks/wallet.hook";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import type { ApartmentListing, ApartmentOwner } from "@/types/hotel";
import { BookingEscrowCheckout } from "@/features/escrow/BookingEscrowCheckout";
import type { BookingDetails } from "@/features/escrow/booking-escrow.machine";
import { computeBookingPrice, countNights } from "@/features/escrow/pricing";

/** What the escrow needs to know about the listing being booked. */
type BookingListing = Pick<ApartmentListing, "id" | "name"> & {
  owner: Pick<ApartmentOwner, "walletAddress">;
};

interface BookingButtonProps {
  listing: BookingListing;
  dateRange?: DateRange;
  guestCount?: number;
  /** Price per night per guest, before taxes and fees. */
  nightlyRate: number;
  isAvailable: boolean;
  onBookingStart?: () => void;
  onBookingComplete?: (bookingId: string, booking: BookingDetails) => void;
  onBookingError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Book → review → deploy escrow → fund escrow, via the one booking escrow
 * flow in features/escrow. Retries are manual and always reconcile first.
 */
const BookingButton: React.FC<BookingButtonProps> = ({
  listing,
  dateRange,
  guestCount = 1,
  nightlyRate,
  isAvailable,
  onBookingStart,
  onBookingComplete,
  onBookingError,
  className,
  disabled = false,
}) => {
  const { handleConnect } = useWallet();
  const { address } = useGlobalAuthenticationStore();

  const booking = React.useMemo<BookingDetails | null>(() => {
    if (!dateRange?.from || !dateRange?.to) return null;
    const nights = countNights(dateRange.from, dateRange.to);
    if (nights < 1) return null;
    return {
      listingId: listing.id,
      listingName: listing.name,
      hostAddress: listing.owner.walletAddress?.trim() ?? "",
      checkIn: format(dateRange.from, "yyyy-MM-dd"),
      checkOut: format(dateRange.to, "yyyy-MM-dd"),
      price: computeBookingPrice({ nightlyRate, nights, guests: guestCount }),
    };
  }, [dateRange, listing, nightlyRate, guestCount]);

  const blockedReason = React.useMemo(() => {
    if (disabled) return "Booking unavailable";
    if (!dateRange?.from || !dateRange?.to) return "Select Dates";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateRange.from < today) return "Check-in date cannot be in the past";
    if (!isAvailable) return "Not Available";
    return null;
  }, [disabled, dateRange, isAvailable]);

  const handleFunded = React.useCallback(
    (intent: { bookingId: string; booking: BookingDetails }) =>
      onBookingComplete?.(intent.bookingId, intent.booking),
    [onBookingComplete],
  );

  return (
    <BookingEscrowCheckout
      listingId={listing.id}
      booking={booking}
      blockedReason={blockedReason}
      guestAddress={address}
      onConnectWallet={() => void handleConnect()}
      onStart={onBookingStart}
      onFunded={handleFunded}
      onError={onBookingError}
      className={className}
    />
  );
};

export { BookingButton };
export default BookingButton;
export type { BookingButtonProps, BookingListing };
