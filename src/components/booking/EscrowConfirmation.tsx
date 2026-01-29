"use client";

import React, { useEffect, useState } from "react";
import {
  BookingData,
  HotelData,
  EscrowResponse,
  EscrowConfirmationProps,
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

// Icons
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Calendar,
  Hotel,
  CreditCard,
  Shield,
  ArrowRight,
  Sparkles,
  Clock,
  FileText,
} from "lucide-react";

/**
 * Animated Success Icon Component
 */
function SuccessIcon() {
  return (
    <div className="relative">
      {/* Outer glow */}
      <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
      
      {/* Inner circle with checkmark */}
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
        <CheckCircle2 className="h-12 w-12 text-white" />
      </div>
      
      {/* Sparkle decorations */}
      <Sparkles className="absolute -right-2 -top-2 h-6 w-6 animate-pulse text-yellow-400" />
      <Sparkles className="absolute -bottom-1 -left-1 h-4 w-4 animate-pulse text-emerald-300" />
    </div>
  );
}

/**
 * Copy to Clipboard Button
 */
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
    >
      {copied ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 text-slate-500" />
          <span className="text-slate-600 dark:text-slate-400">{label}</span>
        </>
      )}
    </button>
  );
}

/**
 * Contract ID Display Component
 */
function ContractIdDisplay({ contractId }: { contractId: string }) {
  // Truncate contract ID for display
  const truncatedId = `${contractId.slice(0, 12)}...${contractId.slice(-12)}`;

  return (
    <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 dark:border-emerald-800 dark:from-emerald-900/20 dark:to-teal-900/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Escrow Contract ID
          </p>
          <p className="mt-1 font-mono text-sm text-slate-700 dark:text-slate-300">
            {truncatedId}
          </p>
        </div>
        <CopyButton text={contractId} label="Copy ID" />
      </div>
    </div>
  );
}

/**
 * Timeline Item Component
 */
function TimelineItem({
  icon: Icon,
  title,
  description,
  isLast = false,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        {!isLast && (
          <div className="mt-2 h-full w-px bg-gradient-to-b from-emerald-200 to-transparent dark:from-emerald-800" />
        )}
      </div>
      <div className="pb-6">
        <h4 className="font-medium text-slate-900 dark:text-white">{title}</h4>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

/**
 * Booking Details Summary
 */
function BookingDetailsSummary({
  booking,
  hotel,
}: {
  booking: BookingData;
  hotel: HotelData;
}) {
  const checkInDate = new Date(booking.checkInDate);
  const checkOutDate = new Date(booking.checkOutDate);
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
      <div className="space-y-1">
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <Hotel className="h-3 w-3" />
          Hotel
        </p>
        <p className="font-medium text-slate-900 dark:text-white">
          {hotel.name}
        </p>
      </div>

      <div className="space-y-1">
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <CreditCard className="h-3 w-3" />
          Total Amount
        </p>
        <p className="font-semibold text-emerald-600 dark:text-emerald-400">
          {booking.totalAmount.toFixed(2)} {booking.currency || "USDC"}
        </p>
      </div>

      <div className="space-y-1">
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="h-3 w-3" />
          Check-in
        </p>
        <p className="font-medium text-slate-900 dark:text-white">
          {checkInDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="space-y-1">
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="h-3 w-3" />
          Duration
        </p>
        <p className="font-medium text-slate-900 dark:text-white">
          {nights} night{nights > 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

/**
 * EscrowConfirmation Component
 * 
 * Displays a beautiful confirmation screen after successful escrow creation
 */
export function EscrowConfirmation({
  booking,
  hotel,
  escrowData,
  onComplete,
  onViewDetails,
}: EscrowConfirmationProps) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className="overflow-hidden border-emerald-200 dark:border-emerald-800">
        <CardContent className="relative pt-12 pb-8">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-900" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <SuccessIcon />

            <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
              Escrow Created Successfully! 🎉
            </h1>

            <p className="mt-2 max-w-md text-slate-600 dark:text-slate-400">
              Your payment is now secured in a blockchain escrow. The hotel will
              receive the funds after your stay is verified.
            </p>

            <Badge className="mt-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Shield className="mr-1 h-3 w-3" />
              Protected by Trustless Work
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Contract Details */}
      <ContractIdDisplay contractId={escrowData.contractId} />

      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingDetailsSummary booking={booking} hotel={hotel} />
        </CardContent>
      </Card>

      {/* What's Next Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">What Happens Next?</CardTitle>
          <CardDescription>
            Here&apos;s what to expect with your escrow-protected booking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            <TimelineItem
              icon={FileText}
              title="Confirmation Email Sent"
              description="You'll receive a confirmation email with your booking and escrow details."
            />
            <TimelineItem
              icon={Calendar}
              title="Check-in Day"
              description="Present your booking confirmation at the hotel. First milestone payment may be released."
            />
            <TimelineItem
              icon={Hotel}
              title="Enjoy Your Stay"
              description="Your payment remains protected throughout your stay."
            />
            <TimelineItem
              icon={CheckCircle2}
              title="Check-out Complete"
              description="Final payment released to hotel after successful checkout."
              isLast
            />
          </div>
        </CardContent>
      </Card>

      {/* Important Information */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100">
          💡 Good to Know
        </h4>
        <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
          <li>• Keep your escrow contract ID for your records</li>
          <li>• You can view your escrow status anytime in your dashboard</li>
          <li>• If any issues arise, contact support with your contract ID</li>
          <li>• Disputes can be raised through the SafeTrust platform</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onComplete}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          size="lg"
        >
          Go to Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        {onViewDetails && (
          <Button
            onClick={onViewDetails}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View Escrow Details
          </Button>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-slate-500">
        Transaction secured on Stellar Network • Powered by Trustless Work
      </p>
    </div>
  );
}

export default EscrowConfirmation;
