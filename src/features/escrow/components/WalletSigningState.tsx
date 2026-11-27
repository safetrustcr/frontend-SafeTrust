"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { stellarExpertTxUrl } from "../config";
import type { WalletSigningStatus } from "../model/lifecycle";
import { cn } from "@/lib/utils";

export interface WalletSigningStateProps {
  status: WalletSigningStatus;
  actionTitle?: string;
  txHash?: string;
  error?: string | null;
  onRetry?: () => void;
  onCancel?: () => void;
  onDone?: () => void;
  className?: string;
}

export function WalletSigningState({
  status,
  actionTitle = "Action",
  txHash,
  error,
  onRetry,
  onCancel,
  onDone,
  className,
}: WalletSigningStateProps) {
  if (status === "idle") {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-all duration-200",
        status === "done" && "border-emerald-500/40 bg-emerald-500/5",
        status === "failed" && "border-destructive/40 bg-destructive/5",
        (status === "awaiting-signature" || status === "submitting") &&
          "border-primary/40 bg-primary/5",
        className,
      )}
    >
      {status === "awaiting-signature" && (
        <div className="space-y-3" role="status" aria-live="polite">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
            <div>
              <p className="font-medium text-foreground">
                Confirm in your wallet
              </p>
              <p className="text-xs text-muted-foreground">
                Please sign the {actionTitle.toLowerCase()} request in your
                wallet.
              </p>
            </div>
          </div>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full rounded-xl"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      )}

      {status === "submitting" && (
        <div className="space-y-3" role="status" aria-live="polite">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
            <div>
              <p className="font-medium text-foreground">
                Confirming on Stellar…
              </p>
              <p className="text-xs text-muted-foreground">
                Broadcasting and awaiting ledger inclusion.
              </p>
            </div>
          </div>
          {txHash && (
            <div className="pt-1">
              <a
                href={stellarExpertTxUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary underline hover:opacity-80"
              >
                <span>View transaction</span>
                <ExternalLink className="h-3 w-3" />
                <span className="sr-only">(opens in new tab)</span>
              </a>
            </div>
          )}
        </div>
      )}

      {status === "done" && (
        <div className="space-y-3" role="status" aria-live="polite">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                {actionTitle} confirmed
              </p>
              <p className="text-xs text-muted-foreground">
                Your transaction has been successfully confirmed on-chain.
              </p>
            </div>
          </div>
          {txHash && (
            <div className="pt-1">
              <a
                href={stellarExpertTxUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary underline hover:opacity-80"
              >
                <span>View on stellar.expert</span>
                <ExternalLink className="h-3 w-3" />
                <span className="sr-only">(opens in new tab)</span>
              </a>
            </div>
          )}
          {onDone && (
            <Button
              type="button"
              className="w-full rounded-xl"
              onClick={onDone}
            >
              Done
            </Button>
          )}
        </div>
      )}

      {status === "failed" && (
        <div className="space-y-3" role="alert" aria-live="assertive">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">
                Transaction failed
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {error ||
                  "An error occurred while executing the transaction. Please try again."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            {onRetry && (
              <Button
                type="button"
                className="flex-1 rounded-xl"
                onClick={onRetry}
              >
                <Shield className="h-4 w-4 mr-1.5" />
                Try again
              </Button>
            )}
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                className="rounded-xl"
                onClick={onCancel}
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
