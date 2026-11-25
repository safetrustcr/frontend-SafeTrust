"use client";

import * as React from "react";
import { DateRange } from "react-day-picker";
import { X } from "lucide-react";
import type { BookingPriceBreakdown } from "@/features/escrow";
import {
  computeBookingPrice,
  countNights,
  HowFeesWorkPopover,
} from "@/features/escrow";
import { formatAmount } from "@/lib/format";

interface PriceCalculatorProps {
  basePrice: number;
  dateRange?: DateRange;
  guestCount: number;
  className?: string;
}

// Same breakdown the booking escrow deploys and funds (features/escrow/pricing).
type PriceBreakdown = BookingPriceBreakdown;

const PriceCalculator: React.FC<PriceCalculatorProps> = ({
  basePrice,
  dateRange,
  guestCount,
  className,
}) => {
  if (!dateRange?.from || !dateRange?.to) {
    return (
      <div className={className}>
        <div className="text-center text-muted-foreground py-4">
          Select dates to see pricing
        </div>
      </div>
    );
  }

  const priceBreakdown = computeBookingPrice({
    nightlyRate: basePrice,
    nights: countNights(dateRange.from, dateRange.to),
    guests: guestCount,
  });

  const isGuestOption = priceBreakdown.feeOption === "guest";

  return (
    <div className={className}>
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="flex items-center space-x-2 text-muted-foreground">
            {formatAmount(basePrice)} <X className="w-3 h-3" />{" "}
            {priceBreakdown.nights} night
            {priceBreakdown.nights === 1
              ? ""
              : "s"} <X className="w-3 h-3" /> {guestCount} guest
            {guestCount > 1 ? "s" : ""}
          </span>
          <span className="font-mono tabular-nums text-foreground">
            {formatAmount(priceBreakdown.subtotal)}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">
            Tax ({Math.round(priceBreakdown.taxRate * 1000) / 10}%)
          </span>
          <span className="font-mono tabular-nums text-foreground">
            {formatAmount(priceBreakdown.tax)}
          </span>
        </div>

        {isGuestOption && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Service fee</span>
            <span className="font-mono tabular-nums text-foreground">
              {formatAmount(priceBreakdown.platformFee)}
            </span>
          </div>
        )}

        <div className="border-t pt-3">
          <div className="flex justify-between items-center font-semibold text-lg">
            <span className="text-foreground">Total</span>
            <span
              data-testid="price-calculator-total"
              className="font-mono tabular-nums text-foreground"
            >
              {formatAmount(priceBreakdown.total)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t text-xs text-muted-foreground">
          <span className="truncate">
            {isGuestOption ? (
              <>
                Released to host:{" "}
                <span className="font-mono tabular-nums text-foreground font-medium">
                  {formatAmount(priceBreakdown.hostPayout)}
                </span>
              </>
            ) : (
              <>
                Host receives:{" "}
                <span className="font-mono tabular-nums text-foreground font-medium">
                  {formatAmount(priceBreakdown.hostPayout)}
                </span>
              </>
            )}
          </span>
          <HowFeesWorkPopover
            price={priceBreakdown}
            triggerText="How fees work"
          />
        </div>
      </div>
    </div>
  );
};

export { PriceCalculator };
export default PriceCalculator;
export type { PriceCalculatorProps, PriceBreakdown };
