"use client"

import * as React from "react"
import { DateRange } from "react-day-picker"
import { differenceInDays } from "date-fns"
import { X } from "lucide-react"

interface PriceCalculatorProps {
  basePrice: number
  dateRange?: DateRange
  guestCount: number
  taxRate?: number
  platformFee?: number
  className?: string
}

interface PriceBreakdown {
  basePrice: number
  subtotal: number
  tax: number
  platformFee: number
  total: number
  nights: number
}

const PriceCalculator: React.FC<PriceCalculatorProps> = ({
  basePrice,
  dateRange,
  guestCount,
  taxRate = 0.1,
  platformFee = 0.05,
  className
}) => {
  const calculatePrice = React.useCallback((): PriceBreakdown => {
    if (!dateRange?.from || !dateRange?.to) {
      return {
        basePrice: 0,
        subtotal: 0,
        tax: 0,
        platformFee: 0,
        total: 0,
        nights: 0
      }
    }

    const nights = differenceInDays(dateRange.to, dateRange.from)
    const subtotal = basePrice * nights * guestCount
    const tax = subtotal * taxRate
    const platformFeeAmount = subtotal * platformFee
    const total = subtotal + tax + platformFeeAmount

    return {
      basePrice: basePrice * nights * guestCount,
      subtotal,
      tax,
      platformFee: platformFeeAmount,
      total,
      nights
    }
  }, [basePrice, dateRange, guestCount, taxRate, platformFee])

  const priceBreakdown = calculatePrice()

  if (!dateRange?.from || !dateRange?.to) {
    return (
      <div className={className}>
        <div className="text-center text-muted-foreground py-4">
          Select dates to see pricing
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="flex items-center space-x-2">
            ${basePrice.toFixed(2)} <X className="w-3 h-3" /> {priceBreakdown.nights} nights <X className="w-3 h-3" /> {guestCount} guest{guestCount > 1 ? 's' : ''}
          </span>
          <span>${priceBreakdown.basePrice.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
          <span>${priceBreakdown.tax.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>SafeTrust Fee ({(platformFee * 100).toFixed(0)}%)</span>
          <span>${priceBreakdown.platformFee.toFixed(2)}</span>
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>${priceBreakdown.total.toFixed(2)}</span>
          </div>
        </div>

      </div>
    </div>
  )
}

export { PriceCalculator }
export type { PriceCalculatorProps, PriceBreakdown }
