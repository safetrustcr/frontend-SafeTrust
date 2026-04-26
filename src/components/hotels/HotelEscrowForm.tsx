"use client";

import React, { useMemo } from "react";
import { useWallet } from "@/components/auth/wallet/hooks/wallet.hook";
import {
  BookingData,
  HotelData,
  RoomData,
  EscrowResponse,
  EscrowType,
} from "@/interfaces/booking-escrow.interface";
import { useBookingEscrow } from "@/hooks/useBookingEscrow";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Trustless Work blocks
import { InitializeEscrowForm as SingleReleaseForm } from "@/components/tw-blocks/escrows/single-release/initialize-escrow/form/InitializeEscrow";
import { InitializeEscrowForm as MultiReleaseForm } from "@/components/tw-blocks/escrows/multi-release/initialize-escrow/form/InitializeEscrow";

// Icons
import {
  Shield,
  Calendar,
  Hotel as HotelIcon,
  CreditCard,
  Wallet,
  Lock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export interface HotelBookingEscrowProps {
  booking: BookingData;
  room?: RoomData;
  hotel: HotelData;
  escrowType: EscrowType;
  onEscrowCreated: (escrow: EscrowResponse) => void;
  onCancel?: () => void;
}

/**
 * Custom validation function for hotel booking escrows
 */
function validateHotelBooking(data: Record<string, unknown>): { 
  error?: string; 
  success?: boolean 
} {
  if (!data?.amount || Number(data.amount) <= 0) {
    return { error: "Amount must be greater than 0" };
  }

  // Additional hotel-specific validations can be added here
  return { success: true };
}

/**
 * Wallet Not Connected State
 */
function WalletNotConnected({ onConnect }: { onConnect: () => void }) {
  return (
    <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700">
      <CardContent className="flex flex-col items-center justify-center py-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Wallet className="h-7 w-7 text-slate-400" />
        </div>
        <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
          Wallet Required
        </h3>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400 max-w-sm">
          Connect your Stellar wallet to create a secure escrow payment for your booking.
        </p>
        <Button onClick={onConnect} className="mt-4">
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Booking Summary Component
 */
function BookingSummary({
  booking,
  hotel,
  room,
}: {
  booking: BookingData;
  hotel: HotelData;
  room?: RoomData;
}) {
  const checkInDate = new Date(booking.checkInDate);
  const checkOutDate = new Date(booking.checkOutDate);
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
      <div className="flex items-center gap-3 mb-4">
        <HotelIcon className="h-5 w-5 text-emerald-500" />
        <span className="font-medium text-slate-900 dark:text-white">
          {hotel.name}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-slate-500">Check-in</span>
          <p className="font-medium">{checkInDate.toLocaleDateString()}</p>
        </div>
        <div>
          <span className="text-slate-500">Check-out</span>
          <p className="font-medium">{checkOutDate.toLocaleDateString()}</p>
        </div>
        <div>
          <span className="text-slate-500">Duration</span>
          <p className="font-medium">{nights} night{nights > 1 ? "s" : ""}</p>
        </div>
        <div>
          <span className="text-slate-500">Amount</span>
          <p className="font-semibold text-emerald-600">
            {booking.totalAmount.toFixed(2)} {booking.currency || "USDC"}
          </p>
        </div>
      </div>

      {room && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <Badge variant="secondary">{room.type || room.name}</Badge>
        </div>
      )}
    </div>
  );
}

/**
 * HotelEscrowForm Component
 * 
 * Integrates Trustless Work escrow forms with hotel booking workflow
 */
export function HotelEscrowForm({
  booking,
  room,
  hotel,
  escrowType,
  onEscrowCreated,
  onCancel,
}: HotelBookingEscrowProps) {
  const { address: guestWallet, connectWallet } = useWallet();

  const {
    escrowFormData,
    milestones,
    isValid,
    validationErrors,
  } = useBookingEscrow({
    bookingData: booking,
    hotelData: hotel,
    escrowType,
  });

  const isWalletConnected = useMemo(() => Boolean(guestWallet), [guestWallet]);

  // Handle successful escrow creation
  const handleSuccess = (response: unknown) => {
    console.log("Escrow created:", response);
    onEscrowCreated(response as EscrowResponse);
  };

  // Handle escrow creation error
  const handleError = (error: unknown) => {
    console.error("Escrow creation failed:", error);
  };

  // Not connected state
  if (!isWalletConnected) {
    return <WalletNotConnected onConnect={connectWallet} />;
  }

  // Single Release Escrow
  if (escrowType === "single_release") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-emerald-500" />
            <div>
              <CardTitle>Secure Your Booking with Escrow</CardTitle>
              <CardDescription>
                Your payment will be held securely until check-out completion
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <BookingSummary booking={booking} hotel={hotel} room={room} />
          
          {!isValid && validationErrors.length > 0 && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              <AlertCircle className="inline-block h-4 w-4 mr-2" />
              {validationErrors[0]}
            </div>
          )}

          <Separator />

          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <SingleReleaseForm />
          </div>

          {onCancel && (
            <div className="flex justify-end">
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Multi-Release Escrow
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-blue-500" />
          <div>
            <CardTitle>Milestone-Based Booking Protection</CardTitle>
            <CardDescription>
              Payment released in stages: check-in and check-out completion
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <BookingSummary booking={booking} hotel={hotel} room={room} />

        {/* Milestone Preview */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Payment Milestones
          </h4>
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium">{milestone.description}</p>
                  {milestone.dueDate && (
                    <p className="text-xs text-slate-500">
                      {new Date(milestone.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <Badge variant="outline">{milestone.metadata?.percentage}%</Badge>
            </div>
          ))}
        </div>

        {!isValid && validationErrors.length > 0 && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle className="inline-block h-4 w-4 mr-2" />
            {validationErrors[0]}
          </div>
        )}

        <Separator />

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <MultiReleaseForm />
        </div>

        {onCancel && (
          <div className="flex justify-end">
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default HotelEscrowForm;
