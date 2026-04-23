"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/components/auth/wallet/hooks/wallet.hook";
import { useBookingEscrow } from "@/hooks/useBookingEscrow";
import {
  BookingData,
  HotelData,
  EscrowType,
  EscrowResponse,
} from "@/interfaces/booking-escrow.interface";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  Hotel,
  CreditCard,
  AlertCircle,
  ChevronRight,
  Lock,
  CheckCircle2,
  Clock,
  Wallet,
  Info,
} from "lucide-react";

export interface EscrowCreationFormProps {
  bookingData: BookingData;
  hotelData: HotelData;
  escrowType: EscrowType;
  onEscrowCreated: (data: EscrowResponse) => void;
  onCancel: () => void;
  className?: string;
}

/**
 * Booking Summary Card Component
 * Displays a beautiful summary of the booking details
 */
function BookingSummaryCard({
  bookingData,
  hotelData,
  escrowType,
}: {
  bookingData: BookingData;
  hotelData: HotelData;
  escrowType: EscrowType;
}) {
  const checkInDate = new Date(bookingData.checkInDate);
  const checkOutDate = new Date(bookingData.checkOutDate);
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl">
      {/* Decorative elements */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
              <Hotel className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{hotelData.name}</h3>
              {hotelData.location && (
                <p className="text-sm text-slate-400">{hotelData.location}</p>
              )}
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
          >
            {escrowType === "multi_release" ? "Milestone" : "Single"} Payment
          </Badge>
        </div>

        <Separator className="my-4 bg-white/10" />

        {/* Booking Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Check-in
            </p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-400" />
              <span className="font-medium">
                {checkInDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Check-out
            </p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-400" />
              <span className="font-medium">
                {checkOutDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Duration
            </p>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-400" />
              <span className="font-medium">
                {nights} night{nights > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Total Amount
            </p>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-400" />
              <span className="text-lg font-bold text-emerald-400">
                {bookingData.totalAmount.toFixed(2)} {bookingData.currency || "USDC"}
              </span>
            </div>
          </div>
        </div>

        {/* Room Type Badge */}
        {bookingData.roomType && (
          <div className="mt-4">
            <Badge variant="secondary" className="bg-white/10 text-white">
              {bookingData.roomType}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Escrow Type Selector Component
 */
function EscrowTypeInfo({ escrowType }: { escrowType: EscrowType }) {
  const isMultiRelease = escrowType === "multi_release";

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            isMultiRelease
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
          }`}
        >
          {isMultiRelease ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Lock className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900 dark:text-white">
            {isMultiRelease ? "Milestone Payment" : "Single Release Payment"}
          </h4>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {isMultiRelease
              ? "Payment released in stages: 70% at check-in verification, 30% after successful checkout."
              : "Full payment held securely until your stay is successfully completed."}
          </p>

          {isMultiRelease && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  1
                </div>
                <span className="text-slate-600 dark:text-slate-400">
                  Check-in: 70% released to hotel
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  2
                </div>
                <span className="text-slate-600 dark:text-slate-400">
                  Check-out: Remaining 30% released
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Security Features Banner
 */
function SecurityBanner() {
  return (
    <div className="rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 dark:border-emerald-800 dark:from-emerald-900/20 dark:to-teal-900/20">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        <div>
          <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">
            Secured by Blockchain Escrow
          </h4>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Your payment is protected by Trustless Work&apos;s smart contract escrow
            on the Stellar network.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Wallet Connection Prompt
 */
function WalletConnectionPrompt({ onConnect }: { onConnect: () => void }) {
  return (
    <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Wallet className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
          Connect Your Wallet
        </h3>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400 max-w-sm">
          To create a secure escrow for your booking, please connect your Stellar
          wallet first.
        </p>
        <Button onClick={onConnect} className="mt-6" size="lg">
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Validation Errors Display
 */
function ValidationErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
        <div>
          <h4 className="font-semibold text-red-900 dark:text-red-100">
            Please fix the following issues:
          </h4>
          <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-300">
            {errors.map((error, index) => (
              <li key={index} className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3" />
                {error}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Main EscrowCreationForm Component
 * A beautiful, fully integrated escrow creation form for hotel bookings
 */
export function EscrowCreationForm({
  bookingData,
  hotelData,
  escrowType,
  onEscrowCreated,
  onCancel,
  className = "",
}: EscrowCreationFormProps) {
  const router = useRouter();
  const { address: walletAddress, connectWallet } = useWallet();
  const [showForm, setShowForm] = useState(false);

  const {
    escrowFormData,
    milestones,
    totalAmount,
    isValid,
    validationErrors,
  } = useBookingEscrow({
    bookingData,
    hotelData,
    escrowType,
  });

  // Determine if wallet is connected
  const isWalletConnected = useMemo(() => Boolean(walletAddress), [walletAddress]);

  // Handle escrow creation success
  const handleSuccess = (data: unknown) => {
    console.log("✅ Escrow created successfully:", data);
    onEscrowCreated(data as EscrowResponse);
  };

  // Handle escrow creation error
  const handleError = (error: unknown) => {
    console.error("❌ Escrow creation failed:", error);
    // Error handling is done by the form component
  };

  // Wallet not connected state
  if (!isWalletConnected) {
    return (
      <div className={`space-y-6 ${className}`}>
        <BookingSummaryCard
          bookingData={bookingData}
          hotelData={hotelData}
          escrowType={escrowType}
        />
        <WalletConnectionPrompt onConnect={connectWallet} />
      </div>
    );
  }

  // Main form view
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Booking Summary */}
      <BookingSummaryCard
        bookingData={bookingData}
        hotelData={hotelData}
        escrowType={escrowType}
      />

      {/* Main Card */}
      <Card className="overflow-hidden border-slate-200 dark:border-slate-700">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Secure Your Booking</CardTitle>
              <CardDescription>
                Create a blockchain escrow to protect your payment
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Security Banner */}
          <SecurityBanner />

          {/* Escrow Type Info */}
          <EscrowTypeInfo escrowType={escrowType} />

          {/* Validation Errors */}
          {!isValid && <ValidationErrors errors={validationErrors} />}

          {/* Info Banner */}
          <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium">How it works:</p>
              <ol className="mt-2 space-y-1 list-decimal list-inside">
                <li>Your payment is locked in a secure smart contract</li>
                <li>The hotel cannot access funds until conditions are met</li>
                <li>If there&apos;s a dispute, our resolution team will help</li>
                <li>After successful checkout, funds are released to the hotel</li>
              </ol>
            </div>
          </div>

          {/* Toggle Form Button or Form */}
          {!showForm ? (
            <div className="text-center py-4">
              <Button
                onClick={() => setShowForm(true)}
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={!isValid}
              >
                <Lock className="mr-2 h-4 w-4" />
                Proceed to Create Escrow
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="mt-3 text-xs text-slate-500">
                You&apos;ll need to sign a transaction with your wallet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Escrow Configuration
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                  className="text-slate-500"
                >
                  ← Back
                </Button>
              </div>
              
              <Separator />
              
              {/* Trustless Work Form */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/50">
                {escrowType === "multi_release" ? (
                  <MultiReleaseForm />
                ) : (
                  <SingleReleaseForm />
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 pt-6">
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancel Booking
          </Button>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="h-3 w-3" />
            <span>Powered by Trustless Work on Stellar</span>
          </div>
        </CardFooter>
      </Card>

      {/* Payment Milestones Preview for Multi-Release */}
      {escrowType === "multi_release" && milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Milestones</CardTitle>
            <CardDescription>
              Your payment will be released according to these milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {milestone.description}
                    </p>
                    {milestone.dueDate && (
                      <p className="text-sm text-slate-500">
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/50 text-emerald-600"
                  >
                    {milestone.metadata?.percentage}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default EscrowCreationForm;
