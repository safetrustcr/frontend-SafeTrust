"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { BookingEscrowWrapper } from "@/components/booking";

/**
 * Hotel Booking Escrow Creation Page
 * 
 * Route: /dashboard/hotel/booking/[bookingId]/escrow
 * 
 * This page allows hotel guests to create a secure escrow contract
 * for their booking payment using Trustless Work's blockchain escrow system.
 */
export default function BookingEscrowPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.bookingId as string;

  const handleComplete = () => {
    router.push(`/dashboard/hotel/booking/${bookingId}/confirmation`);
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
            onClick={() => router.push("/dashboard/hotel")}
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
      </div>
    </div>
  );
}
