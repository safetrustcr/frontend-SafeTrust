"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Users,
  Star,
  Shield,
  Clock,
  ChevronUp,
  ChevronDown,
  X
} from "lucide-react"

interface BookingDetails {
  checkIn?: string
  checkOut?: string
  guests?: number
  nights?: number
}

interface MobileBookingCardProps {
  price?: number
  currency?: string
  rating?: number
  reviewCount?: number
  discountPrice?: number
  taxes?: number
  serviceFee?: number
  cleaningFee?: number
  isOpen?: boolean
  onClose?: () => void
  onBookNow?: (details: BookingDetails) => void
  onReserve?: (details: BookingDetails) => void
}

const MobileBookingCard = ({
  price = 40.18,
  currency = "$",
  rating = 4.8,
  reviewCount = 127,
  discountPrice,
  taxes = 8.50,
  serviceFee = 12.30,
  cleaningFee = 15.00,
  isOpen = false,
  onClose,
  onBookNow,
  onReserve
}: MobileBookingCardProps) => {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    checkIn: "",
    checkOut: "",
    guests: 2,
    nights: 1
  })
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false)

  const subtotal = price * (bookingDetails.nights || 1)
  const totalBeforeTaxes = subtotal + serviceFee + cleaningFee
  const totalPrice = totalBeforeTaxes + taxes

  const handleBookNow = () => {
    if (onBookNow) {
      onBookNow(bookingDetails)
    } else {
      console.log('Mobile booking initiated:', bookingDetails)
    }
  }

  const handleReserve = () => {
    if (onReserve) {
      onReserve(bookingDetails)
    } else {
      console.log('Mobile reservation initiated:', bookingDetails)
    }
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Bottom Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {discountPrice ? (
                  <>
                    <span className="text-red-500">{currency}{discountPrice}</span>
                    <span className="text-lg text-muted-foreground line-through ml-2">
                      {currency}{price}
                    </span>
                  </>
                ) : (
                  <span>{currency}{price}</span>
                )}
              </span>
              <span className="text-muted-foreground">/ night</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{rating}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-4 space-y-4">
            {/* Date Selection */}
            <div className="space-y-3">
              <h3 className="font-semibold">When</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="border rounded-xl p-4 bg-muted/30">
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    CHECK-IN
                  </label>
                  <input
                    type="date"
                    value={bookingDetails.checkIn}
                    onChange={(e) => setBookingDetails(prev => ({ ...prev, checkIn: e.target.value }))}
                    className="w-full text-sm font-medium bg-transparent border-none p-0 focus:outline-none"
                    placeholder="Add date"
                  />
                </div>
                <div className="border rounded-xl p-4 bg-muted/30">
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    CHECK-OUT
                  </label>
                  <input
                    type="date"
                    value={bookingDetails.checkOut}
                    onChange={(e) => setBookingDetails(prev => ({ ...prev, checkOut: e.target.value }))}
                    className="w-full text-sm font-medium bg-transparent border-none p-0 focus:outline-none"
                    placeholder="Add date"
                  />
                </div>
              </div>
            </div>

            {/* Guests Selection */}
            <div className="space-y-3">
              <h3 className="font-semibold">Who</h3>
              <div className="border rounded-xl p-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Guests</span>
                    <p className="text-sm text-muted-foreground">Ages 13 or above</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => setBookingDetails(prev => ({
                        ...prev,
                        guests: Math.max(1, (prev.guests || 1) - 1)
                      }))}
                    >
                      -
                    </Button>
                    <span className="min-w-[2rem] text-center font-medium">
                      {bookingDetails.guests}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => setBookingDetails(prev => ({
                        ...prev,
                        guests: Math.min(8, (prev.guests || 1) + 1)
                      }))}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3">
              <Button
                variant="ghost"
                onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                className="w-full justify-between p-0 h-auto font-semibold"
              >
                <span>Price details</span>
                {showPriceBreakdown ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>

              {showPriceBreakdown && (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-sm">
                    <span>{currency}{price} × {bookingDetails.nights || 1} night{(bookingDetails.nights || 1) > 1 ? 's' : ''}</span>
                    <span>{currency}{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Service fee</span>
                    <span>{currency}{serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cleaning fee</span>
                    <span>{currency}{cleaningFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxes</span>
                    <span>{currency}{taxes.toFixed(2)}</span>
                  </div>
                  <Separator />
                </div>
              )}

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{currency}{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-4 py-4 text-center">
              <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-6 h-6 text-green-500" />
                <span>Secure booking</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-6 h-6 text-blue-500" />
                <span>Free cancellation</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-6 h-6 text-purple-500" />
                <span>Instant booking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="p-4 border-t bg-white space-y-3">
          <Button
            onClick={handleBookNow}
            className="w-full h-14 text-lg font-semibold rounded-xl"
            size="lg"
          >
            Reserve Now
          </Button>
          <Button
            onClick={handleReserve}
            variant="outline"
            className="w-full h-12 rounded-xl"
          >
            Save & Book Later
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            You won't be charged yet
          </p>
        </div>
      </div>
    </div>
  )
}

export default MobileBookingCard