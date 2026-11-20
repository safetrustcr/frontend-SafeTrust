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
import {
  describeReadinessItem,
  READINESS_KEYS,
  READINESS_LABELS,
  summarizeReadiness,
  type CheckoutReadiness,
  type GuestReadiness,
  type ReadinessKey,
} from "../model/readiness";
import { TestnetFaucetHint, TrustlineSteps } from "./TrustlineSteps";

/** Status text and colours chosen for ≥ 4.5:1 contrast in both themes. */
const TONE = {
  ok: "text-emerald-700 dark:text-emerald-300",
  warn: "text-amber-800 dark:text-amber-300",
  unknown: "text-muted-foreground",
} as const;

function ItemIcon({ item }: { item: GuestReadiness }) {
  const common = "mt-0.5 h-4 w-4 shrink-0";
  switch (item.status) {
    case "ready":
      return (
        <CheckCircle2 aria-hidden="true" className={cn(common, TONE.ok)} />
      );
    case "error":
      return (
        <HelpCircle aria-hidden="true" className={cn(common, TONE.unknown)} />
      );
    default:
      return (
        <AlertTriangle aria-hidden="true" className={cn(common, TONE.warn)} />
      );
  }
}

/** Spoken prefix so the state is announced, not only shown by the icon. */
const STATUS_WORD: Record<GuestReadiness["status"], string> = {
  checking: "Checking",
  ready: "Ready",
  "no-trustline": "Not ready",
  "insufficient-balance": "Not ready",
  error: "Couldn't check",
};

function ChecklistItem({
  itemKey,
  item,
}: {
  itemKey: ReadinessKey;
  item: GuestReadiness;
}) {
  return (
    <li
      className="flex min-w-0 items-start gap-2"
      data-testid={`readiness-${itemKey}`}
      data-status={item.status}
    >
      <ItemIcon item={item} />
      <div className="min-w-0">
        <p className="font-medium text-foreground">
          <span className="sr-only">{STATUS_WORD[item.status]}: </span>
          {READINESS_LABELS[itemKey]}
        </p>
        <p
          className={cn(
            "break-words",
            item.status === "ready" || item.status === "error"
              ? "text-muted-foreground"
              : TONE.warn,
          )}
        >
          {describeReadinessItem(itemKey, item)}
        </p>
      </div>
    </li>
  );
}

function ChecklistSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-3">
      <span className="sr-only">Checking wallets…</span>
      {READINESS_KEYS.map((key) => (
        <div
          key={key}
          className="flex items-start gap-2"
          data-testid={`readiness-${key}`}
          data-status="checking"
        >
          <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-sm font-medium text-foreground">
              {READINESS_LABELS[key]}
            </p>
            <Skeleton className="h-3 w-3/4 max-w-56" />
          </div>
        </div>
      ))}
    </div>
  );
}

export interface ReadinessChecklistProps {
  readiness: CheckoutReadiness;
  /** Re-runs the checks. Shown when a check failed or couldn't run. */
  onRetry?: () => void;
  className?: string;
}

/**
 * Pre-signing checklist (#762): the guest's USDC trustline and balance, and
 * whether the host and platform wallets can receive USDC. Every item pairs an
 * icon with text, so the state never relies on colour.
 */
export function ReadinessChecklist({
  readiness,
  onRetry,
  className,
}: ReadinessChecklistProps) {
  const headingId = useId();
  const summary = summarizeReadiness(readiness);
  const allChecking = READINESS_KEYS.every(
    (key) => readiness[key].status === "checking",
  );
  const guest = readiness.guest.status;
  const canRetry =
    !!onRetry && (summary === "error" || summary === "not-ready");

  return (
    <section
      aria-labelledby={headingId}
      data-testid="readiness-checklist"
      data-readiness={summary}
      className={cn("space-y-3 rounded-2xl border p-4 text-sm", className)}
    >
      <h3 id={headingId} className="font-medium text-foreground">
        Before you pay
      </h3>

      {allChecking ? (
        <ChecklistSkeleton />
      ) : (
        <ul className="space-y-3" aria-live="polite">
          {READINESS_KEYS.map((key) => (
            <ChecklistItem key={key} itemKey={key} item={readiness[key]} />
          ))}
        </ul>
      )}

      {guest === "no-trustline" && (
        <div className="space-y-2 border-t pt-3">
          <p className="font-medium text-foreground">
            Add a USDC trustline in your wallet
          </p>
          <TrustlineSteps
            finalStep="Come back here and select Check again."
            showFaucetHint
          />
        </div>
      )}

      {guest === "insufficient-balance" && (
        <div className="space-y-1 border-t pt-3">
          <p className="font-medium text-foreground">Add USDC to your wallet</p>
          <p className="text-muted-foreground">
            Send USDC to this wallet from an exchange or another wallet, then
            select Check again.
          </p>
          <TestnetFaucetHint />
        </div>
      )}

      {summary === "error" && (
        <p className="text-muted-foreground">
          We couldn&apos;t reach the Stellar network to check every wallet.
          Nothing has been charged.
        </p>
      )}

      {canRetry && (
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-3xl"
          onClick={onRetry}
        >
          <RefreshCw aria-hidden="true" className="h-4 w-4" /> Check again
        </Button>
      )}
    </section>
  );
}
