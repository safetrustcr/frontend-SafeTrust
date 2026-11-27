"use client";

import { useId } from "react";

import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { HostPayoutStatus } from "../model/readiness";
import { TrustlineSteps } from "./TrustlineSteps";

export interface HostPayoutReadinessBannerProps {
  status: HostPayoutStatus;
  onRetry?: () => void;
  className?: string;
}

/**
 * Host guidance (#762): until the host's wallet has a USDC trustline, guests
 * can't book their listings, so the dashboard and profile say how to fix it.
 * Renders nothing while the status is unknown.
 */
export function HostPayoutReadinessBanner({
  status,
  onRetry,
  className,
}: HostPayoutReadinessBannerProps) {
  const headingId = useId();
  if (status === "unknown") return null;

  const shell = (children: React.ReactNode, extra?: string) => (
    <section
      aria-labelledby={headingId}
      data-testid="host-payout-banner"
      data-status={status}
      className={cn("min-w-0 rounded-lg border p-4 text-sm", extra, className)}
    >
      {children}
    </section>
  );

  if (status === "checking") {
    return shell(
      <div role="status" aria-busy="true" className="space-y-2">
        <h2 id={headingId} className="font-medium text-foreground">
          Checking your payout wallet…
        </h2>
        <Skeleton className="h-3 w-3/4 max-w-80" />
        <Skeleton className="h-3 w-1/2 max-w-56" />
      </div>,
    );
  }

  if (status === "ready") {
    return shell(
      <h2
        id={headingId}
        className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300"
      >
        <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0" />
        Your wallet can receive USDC payouts.
      </h2>,
      "border-emerald-600/40",
    );
  }

  if (status === "error") {
    return shell(
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <HelpCircle
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
          />
          <div className="min-w-0">
            <h2 id={headingId} className="font-medium">
              We couldn&apos;t check your payout wallet
            </h2>
            <p className="text-muted-foreground">
              We couldn&apos;t reach the Stellar network to confirm your wallet
              can receive USDC.
            </p>
          </div>
        </div>
        {onRetry && (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw aria-hidden="true" className="h-4 w-4" /> Check again
          </Button>
        )}
      </div>,
    );
  }

  return shell(
    <div className="flex min-w-0 items-start gap-3">
      <AlertTriangle
        aria-hidden="true"
        className="mt-0.5 h-5 w-5 shrink-0 text-amber-800 dark:text-amber-300"
      />
      <div className="min-w-0 flex-1 space-y-2">
        <h2
          id={headingId}
          className="font-semibold text-amber-900 dark:text-amber-200"
        >
          Add a USDC trustline to receive payouts
        </h2>
        <p className="text-foreground">
          Guests can&apos;t book your listings until your wallet can receive
          USDC. Your listings show &ldquo;Not ready for bookings&rdquo; until
          then.
        </p>
        <TrustlineSteps finalStep="Refresh this page to confirm you're ready for bookings." />
        {onRetry && (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw aria-hidden="true" className="h-4 w-4" /> Check again
          </Button>
        )}
      </div>
    </div>,
    "border-amber-600/50 bg-amber-50 dark:border-amber-400/40 dark:bg-amber-950/40",
  );
}

/** Badge for a listing whose host can't receive payouts yet. */
export function NotReadyForBookingsBadge() {
  return (
    <span
      data-testid="not-ready-for-bookings"
      className="inline-flex items-center gap-1 rounded-full border border-amber-600/50 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-900 dark:border-amber-400/40 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <AlertTriangle aria-hidden="true" className="h-3 w-3 shrink-0" />
      Not ready for bookings
    </span>
  );
}
