"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Shield,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MISSING_HOST_WALLET_MESSAGE,
  type BookingDetails,
  type BookingEscrowIntent,
  type BookingEscrowState,
} from "./booking-escrow.machine";
import { stellarExpertContractUrl, stellarExpertTxUrl } from "./config";
import { formatAmount } from "@/lib/format";
import { type BookingPriceBreakdown } from "./pricing";
import { useBookingEscrowFlow } from "./useBookingEscrow";

export interface BookingEscrowCheckoutProps {
  /** Resume the active booking for this listing (room page). */
  listingId?: string;
  /** Or pay for a booking that already has an id (payment page). */
  bookingId?: string;
  /** The guest's current selection. null while dates are incomplete. */
  booking: BookingDetails | null;
  /** Why the current selection cannot be booked (unavailable, no dates). */
  blockedReason?: string | null;
  guestAddress: string | null | undefined;
  onConnectWallet: () => void;
  onStart?: () => void;
  onFunded?: (intent: BookingEscrowIntent) => void;
  onError?: (message: string) => void;
  /** Show the stay and price breakdown before the Book button too. */
  showBreakdown?: boolean;
  className?: string;
}

export function PriceBreakdownList({
  price,
}: {
  price: BookingPriceBreakdown;
}) {
  return (
    <dl className="space-y-2 text-sm" aria-label="Price breakdown">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">
          Price ({price.nights} night{price.nights === 1 ? "" : "s"}
          {price.guests > 1 ? ` × ${price.guests} guests` : ""})
        </dt>
        <dd data-testid="breakdown-price">{formatAmount(price.subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">
          Taxes ({Math.round(price.taxRate * 1000) / 10}%)
        </dt>
        <dd data-testid="breakdown-tax">{formatAmount(price.tax)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">
          Platform fee ({price.platformFeePercent}%)
        </dt>
        <dd data-testid="breakdown-platform-fee">
          {formatAmount(price.platformFee)}
        </dd>
      </div>
      <div className="flex justify-between border-t pt-2 font-semibold">
        <dt>Total held in escrow</dt>
        <dd data-testid="escrow-total">{formatAmount(price.total)}</dd>
      </div>
    </dl>
  );
}

function TxLink({ txHash }: { txHash?: string }) {
  if (!txHash) return null;
  return (
    <a
      href={stellarExpertTxUrl(txHash)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm text-blue-600 underline dark:text-blue-400"
    >
      View transaction on stellar.expert <ExternalLink className="h-3 w-3" />
    </a>
  );
}

function StayLine({ booking }: { booking: BookingDetails }) {
  return (
    <p className="text-sm text-muted-foreground">
      {booking.listingName} · {format(parseISO(booking.checkIn), "PP")} →{" "}
      {format(parseISO(booking.checkOut), "PP")}
    </p>
  );
}

const FAILURE_COPY: Record<
  Extract<BookingEscrowState, { step: "failed" }>["reason"],
  string
> = {
  rejected: "You cancelled the signature. Nothing was charged.",
  network: "We couldn't confirm the result.",
  "insufficient-funds":
    "Your wallet doesn't have enough USDC (or no USDC trustline) for this payment. Nothing was charged.",
  "amount-mismatch":
    "This booking already has an escrow for a different amount, so we stopped before charging you. Please contact support.",
  unknown:
    "Something went wrong before anything was sent. Nothing was charged.",
};

export function BookingEscrowCheckout({
  listingId,
  bookingId,
  booking,
  blockedReason,
  guestAddress,
  onConnectWallet,
  onStart,
  onFunded,
  onError,
  showBreakdown = false,
  className,
}: BookingEscrowCheckoutProps) {
  const flow = useBookingEscrowFlow({
    listingId,
    bookingId,
    guestAddress,
    onFunded,
  });
  const [reviewing, setReviewing] = React.useState(false);
  const { state, intent } = flow;

  React.useEffect(() => {
    if (flow.error) onError?.(flow.error);
  }, [flow.error, onError]);

  // A restored booking (after refresh) wins over the date picker.
  const activeBooking: BookingDetails | null =
    intent && state.step !== "idle"
      ? intent.booking
      : (booking ?? intent?.booking ?? null);
  const hostMissing = !!activeBooking && !activeBooking.hostAddress;
  const connected = !!guestAddress && guestAddress.trim().length > 0;

  const errorLine = flow.error ? (
    <p role="alert" className="text-sm text-red-600 dark:text-red-400">
      {flow.error}
    </p>
  ) : null;

  const shell = (children: React.ReactNode) => (
    <div
      className={`space-y-3 ${className ?? ""}`}
      data-escrow-step={state.step}
    >
      {children}
      {errorLine}
    </div>
  );

  if (!flow.ready || (flow.isReconciling && !intent)) {
    return shell(
      <p
        className="flex items-center gap-2 text-sm text-muted-foreground"
        role="status"
      >
        <Loader2 className="h-4 w-4 animate-spin" /> Checking your booking
        status…
      </p>,
    );
  }

  // ---- in-progress or finished booking --------------------------------------
  if (intent && state.step !== "idle") {
    const b = intent.booking;
    const header = (
      <div className="space-y-2 rounded-2xl border p-4">
        <StayLine booking={b} />
        <PriceBreakdownList price={b.price} />
      </div>
    );

    switch (state.step) {
      case "deploy:awaiting-signature":
      case "fund:awaiting-signature":
        return shell(
          <>
            {header}
            <div className="flex items-center gap-2" role="status">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>
                Confirm in your wallet (step{" "}
                {state.step === "deploy:awaiting-signature" ? "1" : "2"} of 2)
              </span>
            </div>
            <Button
              variant="outline"
              className="w-full rounded-3xl"
              onClick={flow.cancel}
            >
              Cancel
            </Button>
          </>,
        );

      case "deploy:submitted":
      case "fund:submitted":
        return shell(
          <>
            {header}
            <div className="flex items-center gap-2" role="status">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Confirming on Stellar…</span>
            </div>
            <TxLink txHash={state.txHash} />
          </>,
        );

      case "deployed":
        return shell(
          <>
            {header}
            <p className="text-sm">
              Escrow created. Fund it to confirm your booking
            </p>
            <Button
              className="h-12 w-full rounded-3xl"
              onClick={flow.fundNow}
              disabled={flow.isBusy}
            >
              {flow.isBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wallet className="h-4 w-4" />
              )}
              Fund now - {formatAmount(intent.amount)}
            </Button>
            {flow.canDiscard && (
              <Button variant="ghost" className="w-full" onClick={flow.discard}>
                Start over
              </Button>
            )}
          </>,
        );

      case "funded":
        return shell(
          <div className="space-y-2 rounded-2xl border border-emerald-500/40 p-4">
            <p className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" /> Booking confirmed
            </p>
            <StayLine booking={b} />
            <p className="text-sm">
              {formatAmount(intent.amount)} is held in escrow until your stay is
              complete.
            </p>
            <a
              href={stellarExpertContractUrl(state.contractId)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 underline dark:text-blue-400"
            >
              View escrow on stellar.expert <ExternalLink className="h-3 w-3" />
            </a>
          </div>,
        );

      case "failed": {
        const retryLabel =
          state.reason === "network" ? "Check again" : "Try again";
        return shell(
          <>
            {header}
            <p className="flex items-start gap-2 text-sm" role="alert">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              {FAILURE_COPY[state.reason]}
            </p>
            {state.reason !== "amount-mismatch" && (
              <Button
                className="h-12 w-full rounded-3xl"
                onClick={flow.retry}
                disabled={flow.isBusy}
              >
                {flow.isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                {retryLabel}
              </Button>
            )}
            {flow.inFlight && state.reason === "rejected" && (
              <p className="text-xs text-muted-foreground">
                Close the wallet window to try again.
              </p>
            )}
            {flow.canDiscard && (
              <Button variant="ghost" className="w-full" onClick={flow.discard}>
                Start over
              </Button>
            )}
          </>,
        );
      }
    }
  }

  // ---- nothing started yet (or an idle draft) --------------------------------
  if (!connected) {
    return shell(
      <Button className="h-12 w-full rounded-3xl" onClick={onConnectWallet}>
        <Wallet className="h-4 w-4" /> Connect Wallet to Book
      </Button>,
    );
  }

  if (!activeBooking) {
    return shell(
      <Button className="h-12 w-full rounded-3xl" disabled>
        {blockedReason ?? "Select Dates"}
      </Button>,
    );
  }

  if (hostMissing) {
    return shell(
      <>
        <Button className="h-12 w-full rounded-3xl" disabled>
          <Shield className="h-4 w-4" /> Book Now -{" "}
          {formatAmount(activeBooking.price.total)}
        </Button>
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {MISSING_HOST_WALLET_MESSAGE}
        </p>
      </>,
    );
  }

  // Block whenever the date-picker selection is what would be booked. Only a
  // restored draft shown in place of an empty picker skips the picker's reason.
  if (blockedReason && activeBooking === booking) {
    return shell(
      <Button className="h-12 w-full rounded-3xl" disabled>
        {blockedReason}
      </Button>,
    );
  }

  if (!reviewing) {
    return shell(
      <>
        {showBreakdown && (
          <div className="space-y-2">
            <StayLine booking={activeBooking} />
            <PriceBreakdownList price={activeBooking.price} />
          </div>
        )}
        <Button
          className="h-12 w-full rounded-3xl"
          onClick={() => setReviewing(true)}
          disabled={flow.isBusy}
        >
          <Shield className="h-4 w-4" />
          {intent ? "Continue booking" : "Book Now"} -{" "}
          {formatAmount(activeBooking.price.total)}
        </Button>
      </>,
    );
  }

  return shell(
    <>
      <div className="space-y-2 rounded-2xl border p-4">
        <p className="font-medium">Review your payment</p>
        <StayLine booking={activeBooking} />
        <PriceBreakdownList price={activeBooking.price} />
        <p className="text-xs text-muted-foreground">
          You&apos;ll sign twice: once to create the escrow, once to fund it.
        </p>
      </div>
      <Button
        className="h-12 w-full rounded-3xl"
        disabled={flow.isBusy}
        onClick={() => {
          onStart?.();
          void flow.start(activeBooking);
        }}
      >
        {flow.isBusy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Shield className="h-4 w-4" />
        )}
        Confirm and pay {formatAmount(activeBooking.price.total)}
      </Button>
      <Button
        variant="ghost"
        className="w-full"
        onClick={() => setReviewing(false)}
      >
        Back
      </Button>
    </>,
  );
}
