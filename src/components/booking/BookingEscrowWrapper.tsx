"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BookingData,
  HotelData,
  RoomData,
  EscrowResponse,
  EscrowType,
} from "@/interfaces/booking-escrow.interface";
import { EscrowCreationForm } from "./EscrowCreationForm";
import { EscrowConfirmation } from "./EscrowConfirmation";

// Providers
import { TrustlessWorkProvider } from "@/components/tw-blocks/providers/TrustlessWork";
import { WalletProvider } from "@/components/tw-blocks/wallet-kit/WalletProvider";
import { EscrowProvider } from "@/components/tw-blocks/providers/EscrowProvider";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export interface BookingEscrowWrapperProps {
  bookingId: string;
  onComplete?: () => void;
  // Optional pre-loaded data (for testing or when data is already available)
  initialBookingData?: BookingData;
  initialHotelData?: HotelData;
  initialRoomData?: RoomData;
}

type Step = "loading" | "form" | "confirmation" | "error";

/**
 * Loading Spinner Component
 */
function LoadingSpinner({ message = "Loading booking details..." }: { message?: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
          <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-emerald-500/20" />
        </div>
        <p className="mt-4 text-sm text-slate-500">{message}</p>
      </CardContent>
    </Card>
  );
}

/**
 * Error State Component
 */
function ErrorState({ 
  message, 
  onRetry 
}: { 
  message: string; 
  onRetry: () => void;
}) {
  return (
    <Card className="border-red-200 dark:border-red-800">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <span className="text-3xl">⚠️</span>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-red-900 dark:text-red-100">
          Unable to Load Booking
        </h3>
        <p className="mt-2 text-center text-sm text-red-700 dark:text-red-300 max-w-sm">
          {message}
        </p>
        <button
          onClick={onRetry}
          className="mt-6 rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </CardContent>
    </Card>
  );
}

/**
 * Simulated API functions - Replace with actual API calls
 */
async function getBooking(bookingId: string): Promise<BookingData> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/bookings/${bookingId}`);
  // return response.json();
  
  // Simulated response for development
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: bookingId,
        roomId: "room-001",
        hotelId: "hotel-001",
        totalAmount: 450.00,
        currency: "USDC",
        checkInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        checkOutDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        guestEmail: "guest@example.com",
        guestName: "John Doe",
        roomType: "Deluxe Suite",
        cancellationPolicy: "Free cancellation until 24 hours before check-in",
        preferences: {
          milestonePayments: true,
        },
      });
    }, 1000);
  });
}

async function getHotel(hotelId: string): Promise<HotelData> {
  // TODO: Replace with actual API call
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: hotelId,
        name: "Grand Stellar Hotel",
        walletAddress: "GBCXK3ZQWFWMQJXLSIMVCAHUKTJVWRJPB5XYGZGQCVBWKWVEPTSYLUHI",
        rating: 4.8,
        location: "Downtown, New York City",
        imageUrl: "/img/hotels.png",
      });
    }, 500);
  });
}

async function updateBookingWithEscrow(
  bookingId: string,
  escrowData: {
    contractId: string;
    escrowStatus: string;
    unsignedXDR?: string;
  }
): Promise<void> {
  // TODO: Replace with actual API call
  // await fetch(`/api/bookings/${bookingId}/escrow`, {
  //   method: 'PATCH',
  //   body: JSON.stringify(escrowData),
  // });
  
  console.log("Updating booking with escrow:", { bookingId, escrowData });
  return new Promise((resolve) => setTimeout(resolve, 500));
}

/**
 * BookingEscrowWrapper Component
 * 
 * Main integration component that manages the entire escrow creation flow:
 * 1. Loading booking and hotel data
 * 2. Displaying the escrow creation form
 * 3. Handling escrow creation success
 * 4. Showing confirmation after creation
 */
export function BookingEscrowWrapper({
  bookingId,
  onComplete,
  initialBookingData,
  initialHotelData,
}: BookingEscrowWrapperProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(initialBookingData ? "form" : "loading");
  const [error, setError] = useState<string | null>(null);
  const [escrowData, setEscrowData] = useState<EscrowResponse | null>(null);
  
  // Booking and hotel data
  const [bookingData, setBookingData] = useState<BookingData | null>(
    initialBookingData || null
  );
  const [hotelData, setHotelData] = useState<HotelData | null>(
    initialHotelData || null
  );

  // Determine escrow type based on user preferences
  const escrowType: EscrowType = useMemo(() => {
    if (bookingData?.preferences?.milestonePayments) {
      return "multi_release";
    }
    return "single_release";
  }, [bookingData?.preferences?.milestonePayments]);

  // Load booking data on mount
  useEffect(() => {
    if (initialBookingData && initialHotelData) {
      setStep("form");
      return;
    }

    async function loadData() {
      try {
        setStep("loading");
        setError(null);

        const booking = await getBooking(bookingId);
        setBookingData(booking);

        const hotel = await getHotel(booking.hotelId);
        setHotelData(hotel);

        setStep("form");
      } catch (err) {
        console.error("Failed to load booking data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load booking details. Please try again."
        );
        setStep("error");
      }
    }

    loadData();
  }, [bookingId, initialBookingData, initialHotelData]);

  // Handle escrow creation success
  const handleEscrowCreated = async (escrowResponse: EscrowResponse) => {
    try {
      // Update booking with escrow information
      await updateBookingWithEscrow(bookingId, {
        contractId: escrowResponse.contractId,
        escrowStatus: escrowResponse.status,
        unsignedXDR: escrowResponse.unsignedXDR,
      });

      setEscrowData(escrowResponse);
      setStep("confirmation");
    } catch (err) {
      console.error("Failed to update booking with escrow:", err);
      // Still show confirmation even if update fails
      setEscrowData(escrowResponse);
      setStep("confirmation");
    }
  };

  // Handle cancellation
  const handleCancel = () => {
    router.push(`/dashboard/hotel/details?id=${bookingData?.hotelId || ""}`);
  };

  // Handle completion
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    } else {
      router.push(`/dashboard`);
    }
  };

  // Handle retry on error
  const handleRetry = () => {
    setError(null);
    setStep("loading");
  };

  // Render based on current step
  return (
    <TrustlessWorkProvider>
      <WalletProvider>
        <EscrowProvider>
          <div className="w-full max-w-3xl mx-auto px-4 py-8">
            {/* Step indicator */}
            {step !== "loading" && step !== "error" && (
              <div className="mb-8">
                <div className="flex items-center justify-center gap-4">
                  <StepIndicator
                    number={1}
                    label="Create Escrow"
                    active={step === "form"}
                    completed={step === "confirmation"}
                  />
                  <div className="h-px w-12 bg-slate-300 dark:bg-slate-700" />
                  <StepIndicator
                    number={2}
                    label="Confirm"
                    active={step === "confirmation"}
                    completed={false}
                  />
                </div>
              </div>
            )}

            {/* Loading state */}
            {step === "loading" && <LoadingSpinner />}

            {/* Error state */}
            {step === "error" && error && (
              <ErrorState message={error} onRetry={handleRetry} />
            )}

            {/* Form state */}
            {step === "form" && bookingData && hotelData && (
              <EscrowCreationForm
                bookingData={bookingData}
                hotelData={hotelData}
                escrowType={escrowType}
                onEscrowCreated={handleEscrowCreated}
                onCancel={handleCancel}
              />
            )}

            {/* Confirmation state */}
            {step === "confirmation" && bookingData && hotelData && escrowData && (
              <EscrowConfirmation
                booking={bookingData}
                hotel={hotelData}
                escrowData={escrowData}
                onComplete={handleComplete}
                onViewDetails={() =>
                  router.push(`/dashboard?escrowId=${escrowData.contractId}`)
                }
              />
            )}
          </div>
        </EscrowProvider>
      </WalletProvider>
    </TrustlessWorkProvider>
  );
}

/**
 * Step Indicator Component
 */
function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
          completed
            ? "bg-emerald-500 text-white"
            : active
            ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-slate-100 text-slate-400 dark:bg-slate-800"
        }`}
      >
        {completed ? "✓" : number}
      </div>
      <span
        className={`text-xs font-medium ${
          active || completed
            ? "text-emerald-700 dark:text-emerald-400"
            : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export default BookingEscrowWrapper;
