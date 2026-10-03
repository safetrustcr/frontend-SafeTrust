"use client";

import React, { use } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { WalletProviderScoped } from "@/providers/WalletProviderScoped";

/**
 * Lazy-load the heavy escrow bundle (TrustlessWork SDK + EscrowProviders +
 * stellar-wallets-kit) so it is not part of the route's first-load chunk.
 */
const BookingEscrowWrapper = dynamic(
  () =>
    import("@/components/booking/BookingEscrowWrapper").then(
      (m) => m.BookingEscrowWrapper,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-24 text-slate-500">
        Loading escrow form…
      </div>
    ),
  },
);

/**
 * Hotel Booking Escrow Creation Page
 *
 * Route: /bookings/[bookingId]/escrow
 *
 * This page allows hotel guests to create a secure escrow contract
 * for their booking payment using Trustless Work's blockchain escrow system.
 */
export default function BookingEscrowPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = use(params);
  const router = useRouter();

  const handleComplete = () => {
    router.push("/dashboard/escrow-dashboard");
  };

  if (!bookingId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Booking ID Required
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Please provide a valid booking ID to create an escrow.
          </p>
          <button
            onClick={() => router.push("/hotels")}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Go to Hotels
          </button>
        </div>
      </div>
    );
  }

  return (
    <WalletProviderScoped>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <BookingEscrowWrapper
            bookingId={bookingId}
            onComplete={handleComplete}
          />
        </div>
      </div>
    </WalletProviderScoped>
  );
}
