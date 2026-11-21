"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatEscrowAmount } from "@/lib/format";
import { validateDisputeSplit, type DisputeDetails } from "../model/lifecycle";
import { cn } from "@/lib/utils";

export interface DisputeResolverViewProps {
  totalBalance: number;
  currency?: string;
  disputeDetails?: DisputeDetails;
  onResolve: (split: {
    guestAmount: number;
    hostAmount: number;
    resolverNotes?: string;
  }) => void;
  isSubmitting?: boolean;
  className?: string;
}

const MAX_NOTES_LENGTH = 500;

export function DisputeResolverView({
  totalBalance,
  currency = "USDC",
  disputeDetails,
  onResolve,
  isSubmitting = false,
  className,
}: DisputeResolverViewProps) {
  // Default to a 50/50 split
  const [guestAmountStr, setGuestAmountStr] = React.useState<string>(
    (totalBalance / 2).toFixed(2),
  );
  const [hostAmountStr, setHostAmountStr] = React.useState<string>(
    (totalBalance / 2).toFixed(2),
  );
  const [resolverNotes, setResolverNotes] = React.useState<string>("");

  const guestAmount = parseFloat(guestAmountStr) || 0;
  const hostAmount = parseFloat(hostAmountStr) || 0;

  const validation = validateDisputeSplit(
    guestAmount,
    hostAmount,
    totalBalance,
  );

  const setPreset = (guestPercent: number) => {
    const guest = Math.round(((totalBalance * guestPercent) / 100) * 100) / 100;
    const host = Math.round((totalBalance - guest) * 100) / 100;
    setGuestAmountStr(guest.toFixed(2));
    setHostAmountStr(host.toFixed(2));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percent = parseFloat(e.target.value);
    setPreset(percent);
  };

  const handleAutoBalanceHost = () => {
    const remaining = Math.max(
      0,
      Math.round((totalBalance - guestAmount) * 100) / 100,
    );
    setHostAmountStr(remaining.toFixed(2));
  };

  const handleAutoBalanceGuest = () => {
    const remaining = Math.max(
      0,
      Math.round((totalBalance - hostAmount) * 100) / 100,
    );
    setGuestAmountStr(remaining.toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.valid) return;
    onResolve({
      guestAmount,
      hostAmount,
      resolverNotes: resolverNotes.trim() || undefined,
    });
  };

  const currentGuestPercent =
    totalBalance > 0
      ? Math.max(
          0,
          Math.min(100, Math.round((guestAmount / totalBalance) * 100)),
        )
      : 0;

  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6",
        className,
      )}
      aria-label="Dispute resolver panel"
    >
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-primary/10 text-primary">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Dispute Resolution Panel
            </h3>
            <p className="text-xs text-muted-foreground">
              Arbitrate dispute and allocate the locked escrow balance.
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Escrow Balance</p>
          <p className="text-xl font-bold font-mono text-foreground">
            {formatEscrowAmount(totalBalance, currency)}
          </p>
        </div>
      </div>

      {disputeDetails && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-destructive">
              Dispute Claim
            </span>
            <span className="text-xs text-muted-foreground">
              Opened by {disputeDetails.openedBy} on {disputeDetails.openedAt}
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground">
            Reason: {disputeDetails.reason}
          </p>
          {disputeDetails.description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              &quot;{disputeDetails.description}&quot;
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Presets */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            Quick Allocation Presets
          </Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreset(100)}
              className="text-xs rounded-xl"
            >
              100% Guest / 0% Host
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreset(50)}
              className="text-xs rounded-xl"
            >
              50% / 50% Split
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreset(0)}
              className="text-xs rounded-xl"
            >
              0% Guest / 100% Host
            </Button>
          </div>
        </div>

        {/* Interactive Split Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-primary font-semibold">
              Guest: {currentGuestPercent}%
            </span>
            <span className="text-muted-foreground">Split Ratio</span>
            <span className="text-primary font-semibold">
              Host: {100 - currentGuestPercent}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={currentGuestPercent}
            onChange={handleSliderChange}
            disabled={isSubmitting}
            className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
            aria-label="Split ratio slider"
          />
        </div>

        {/* Direct Numeric Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="guest-split-input"
                className="text-sm font-semibold"
              >
                Guest Refund ({currency})
              </Label>
              <button
                type="button"
                onClick={handleAutoBalanceGuest}
                className="text-xs text-primary underline hover:opacity-80"
              >
                Auto-balance
              </button>
            </div>
            <Input
              id="guest-split-input"
              type="number"
              step="0.01"
              min="0"
              max={totalBalance}
              value={guestAmountStr}
              onChange={(e) => setGuestAmountStr(e.target.value)}
              disabled={isSubmitting}
              className="font-mono text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="host-split-input"
                className="text-sm font-semibold"
              >
                Host Payout ({currency})
              </Label>
              <button
                type="button"
                onClick={handleAutoBalanceHost}
                className="text-xs text-primary underline hover:opacity-80"
              >
                Auto-balance
              </button>
            </div>
            <Input
              id="host-split-input"
              type="number"
              step="0.01"
              min="0"
              max={totalBalance}
              value={hostAmountStr}
              onChange={(e) => setHostAmountStr(e.target.value)}
              disabled={isSubmitting}
              className="font-mono text-base"
              required
            />
          </div>
        </div>

        {/* Live Validation & Status Badge */}
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "p-3 rounded-2xl border flex items-center justify-between text-xs",
            validation.valid
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium"
              : "border-destructive/40 bg-destructive/10 text-destructive font-medium",
          )}
        >
          <div className="flex items-center gap-2">
            {validation.valid ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>
              {validation.valid
                ? `Split equals balance exactly: ${(guestAmount + hostAmount).toFixed(2)} ${currency}`
                : validation.error}
            </span>
          </div>
          <span className="font-mono tabular-nums font-semibold">
            Sum: {(guestAmount + hostAmount).toFixed(2)} /{" "}
            {totalBalance.toFixed(2)}
          </span>
        </div>

        {/* Resolver Notes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="resolver-notes" className="text-sm font-medium">
              Resolver Findings & Decision Justification (Optional)
            </Label>
            <span
              className={`text-xs ${
                resolverNotes.length > MAX_NOTES_LENGTH
                  ? "text-destructive font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {resolverNotes.length}/{MAX_NOTES_LENGTH}
            </span>
          </div>
          <Textarea
            id="resolver-notes"
            value={resolverNotes}
            onChange={(e) => setResolverNotes(e.target.value)}
            placeholder="Record justification for split ratio, inspected evidence, or resolution conditions…"
            className="min-h-[80px] resize-none text-sm"
            maxLength={MAX_NOTES_LENGTH}
            disabled={isSubmitting}
          />
        </div>

        {/* Action Button */}
        <Button
          type="submit"
          disabled={!validation.valid || isSubmitting}
          className="h-12 w-full rounded-2xl text-base font-semibold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Executing Dispute Resolution…
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4 mr-2" />
              Resolve Dispute and Execute Split
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
