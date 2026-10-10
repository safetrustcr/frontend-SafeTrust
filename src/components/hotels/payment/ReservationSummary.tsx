"use client";

import type React from "react";
import { useWallet } from "@/components/auth/wallet/hooks/wallet.hook";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { BookingEscrowCheckout } from "@/features/escrow/BookingEscrowCheckout";
import type { BookingDetails } from "@/features/escrow/booking-escrow.machine";

interface ReservationSummaryProps {
  /** From `?bookingId=`: the escrow engagementId. Paying requires one. */
  bookingId: string;
  booking: BookingDetails;
}

/**
 * Payment summary for an existing booking. Uses the same booking escrow flow
 * as the room page, keyed by bookingId, so a booking paid on /room is
 * recognised here (reconcile) instead of being deployed a second time.
 */
const ReservationSummary: React.FC<ReservationSummaryProps> = ({
  bookingId,
  booking,
}) => {
  const { handleConnect } = useWallet();
  const { address } = useGlobalAuthenticationStore();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Reservation Summary
      </h2>

      <div className="h-px bg-gray-200 dark:bg-gray-700 w-full my-4" />

      {bookingId ? (
        <BookingEscrowCheckout
          bookingId={bookingId}
          booking={booking}
          guestAddress={address}
          onConnectWallet={() => void handleConnect()}
          showBreakdown
        />
      ) : (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          This page needs a booking reference. Start your booking from the room
          page to pay with escrow.
        </p>
      )}
    </div>
  );
};

export default ReservationSummary;
