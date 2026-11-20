"use client";

import * as React from "react";
import { Info, ShieldCheck } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatAmount } from "@/lib/format";
import type { BookingPriceBreakdown } from "../model/pricing";
import { cn } from "@/lib/utils";

export interface HowFeesWorkPopoverProps {
  price: BookingPriceBreakdown;
  className?: string;
  triggerClassName?: string;
  triggerText?: string;
  align?: "start" | "center" | "end";
}

export function HowFeesWorkPopover({
  price,
  className,
  triggerClassName,
  triggerText = "How fees work",
  align = "end",
}: HowFeesWorkPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="How fees work"
          className={cn(
            "inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm",
            triggerClassName,
          )}
        >
          <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{triggerText}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={6}
        className={cn("w-80 max-w-[calc(100vw-2rem)] p-4 text-xs", className)}
        data-testid="how-fees-work-popover"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b pb-2">
            <ShieldCheck
              className="h-4 w-4 text-primary shrink-0"
              aria-hidden="true"
            />
            <h4 className="font-semibold text-foreground text-sm">
              How escrow fees work
            </h4>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            Funds stay safely locked in the Trustless Work smart contract on
            Stellar until check-out. Fees are deducted only when funds are
            released, not before.
          </p>

          <div className="rounded-lg bg-muted/60 p-2.5 space-y-1.5 border">
            <p className="font-medium text-foreground text-[11px] uppercase tracking-wider">
              Release breakdown
            </p>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Locked in escrow</span>
              <span className="font-mono tabular-nums text-foreground font-semibold">
                {formatAmount(price.total)}
              </span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>SafeTrust platform fee ({price.platformFeePercent}%)</span>
              <span className="font-mono tabular-nums text-foreground">
                −{formatAmount(price.effectivePlatformFee)}
              </span>
            </div>
            {price.includesProtocolFee ? (
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Trustless Work fee (0.3% · mainnet)</span>
                <span className="font-mono tabular-nums text-foreground">
                  −{formatAmount(price.trustlessWorkFee)}
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center text-muted-foreground text-[11px] italic">
                <span>Trustless Work fee (0.3%)</span>
                <span>Mainnet only (0% on testnet)</span>
              </div>
            )}
            <div className="flex justify-between items-center border-t pt-1.5 font-semibold text-foreground">
              <span>Host payout at release</span>
              <span
                className="font-mono tabular-nums text-emerald-800 dark:text-emerald-400 font-bold"
                data-testid="popover-host-payout"
              >
                {formatAmount(price.hostPayout)}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {price.feeOption === "guest" ? (
              <>
                <strong className="text-foreground">Guest-covered fees:</strong>{" "}
                Deposit is grossed up so the host receives exactly stay + tax (
                {formatAmount(price.hostPayout)}) after release deductions.
              </>
            ) : (
              <>
                <strong className="text-foreground">Host-covered fees:</strong>{" "}
                Guest deposits stay + tax. Platform and network fees are
                deducted from the host&apos;s payout upon check-out release.
              </>
            )}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
