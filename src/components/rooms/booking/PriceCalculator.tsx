"use client";

import * as React from "react";
import { DateRange } from "react-day-picker";
import { X } from "lucide-react";
import {
  computeBookingPrice,
  countNights,
  type BookingPriceBreakdown,
} from "@/features/escrow/pricing";
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

  return (
    <div className={className}>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="flex items-center space-x-2">
            {formatAmount(basePrice)} <X className="w-3 h-3" />{" "}
            {priceBreakdown.nights} nights <X className="w-3 h-3" />{" "}
            {guestCount} guest{guestCount > 1 ? "s" : ""}
          </span>
          <span>{formatAmount(priceBreakdown.subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Tax ({Math.round(priceBreakdown.taxRate * 1000) / 10}%)</span>
          <span>{formatAmount(priceBreakdown.tax)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>SafeTrust Fee ({priceBreakdown.platformFeePercent}%)</span>
          <span>{formatAmount(priceBreakdown.platformFee)}</span>
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span data-testid="price-calculator-total">
              {formatAmount(priceBreakdown.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { PriceCalculator };
export default PriceCalculator;
export type { PriceCalculatorProps, PriceBreakdown };
