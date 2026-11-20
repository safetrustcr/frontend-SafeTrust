"use client";

import * as React from "react";
import { Coins } from "lucide-react";
import { formatAmount } from "@/lib/format";
import type { BookingPriceBreakdown } from "../model/pricing";
import { HowFeesWorkPopover } from "./HowFeesWorkPopover";
import { cn } from "@/lib/utils";

export interface HostPayoutPreviewProps {
  price: BookingPriceBreakdown;
  className?: string;
  variant?: "card" | "inline";
}

export function HostPayoutPreview({
  price,
  className,
  variant = "card",
}: HostPayoutPreviewProps) {
  const isGuestOption = price.feeOption === "guest";

  const feeDescription = price.includesProtocolFee
    ? `${price.platformFeePercent}% SafeTrust fee and 0.3% network fee`
    : `${price.platformFeePercent}% SafeTrust fee`;

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "inline-flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground",
          className,
        )}
        data-testid="host-payout-preview-inline"
      >
        <span>
          {isGuestOption ? (
            <>
              Released to the host after check-out:{" "}
              <strong className="font-mono tabular-nums text-foreground">
                {formatAmount(price.hostPayout)}
              </strong>
            </>
          ) : (
            <>
              You receive{" "}
              <strong className="font-mono tabular-nums text-foreground">
                {formatAmount(price.hostPayout)}
              </strong>{" "}
              after the {feeDescription}.
            </>
          )}
        </span>
        <HowFeesWorkPopover price={price} triggerText="ⓘ" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border bg-card/60 p-3.5 text-xs text-card-foreground shadow-xs transition-colors",
        className,
      )}
      data-testid="host-payout-preview"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className="rounded-md bg-primary/10 p-1.5 text-primary shrink-0 mt-0.5">
            <Coins className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="space-y-0.5">
            <p className="font-medium text-foreground text-xs">
              Host Payout Preview
            </p>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              {isGuestOption ? (
                <>
                  Released to the host after check-out:{" "}
                  <span className="font-semibold text-foreground font-mono tabular-nums">
                    {formatAmount(price.hostPayout)}
                  </span>{" "}
                  (guest covers platform & network fees).
                </>
              ) : (
                <>
                  You receive{" "}
                  <span className="font-semibold text-foreground font-mono tabular-nums">
                    {formatAmount(price.hostPayout)}
                  </span>{" "}
                  after the {feeDescription}.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0">
          <span className="font-mono tabular-nums text-sm font-bold text-emerald-800 dark:text-emerald-400">
            {formatAmount(price.hostPayout)}
          </span>
          <HowFeesWorkPopover price={price} triggerText="How fees work" />
        </div>
      </div>
    </div>
  );
}
