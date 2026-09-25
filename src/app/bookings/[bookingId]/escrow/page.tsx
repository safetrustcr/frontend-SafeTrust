"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { BookingEscrowWrapper } from "@/components/booking";
import { HotelMilestoneActions } from "@/components/listings";
import type { EscrowData } from "@/components/dashboard/RoleEscrowDashboard";

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

  // FE-09 gate: milestones render only once a funded/active escrow exists.
  // BookingEscrowWrapper does not expose escrow state yet, so this stays
  // null (renders nothing) until the state lift lands.
  const [milestoneEscrow] = React.useState<EscrowData | null>(null);
  const showMilestones =
    milestoneEscrow !== null &&
    (milestoneEscrow.status === "funded" ||
      milestoneEscrow.status === "check_in_approved");

  const handleComplete = () => {
    router.push(`/bookings/${bookingId}/confirmation`);
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <BookingEscrowWrapper
          bookingId={bookingId}
          onComplete={handleComplete}
        />
        {showMilestones && milestoneEscrow && (
          <div className="mx-auto mt-6 w-full max-w-3xl">
            <HotelMilestoneActions escrow={milestoneEscrow} userRole="guest" />
          </div>
        )}
      </div>
    </div>
  );
}
