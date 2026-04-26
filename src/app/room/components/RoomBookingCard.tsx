"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Users, Star, Shield, CreditCard, Clock } from "lucide-react"

interface BookingDetails {
  checkIn?: string
  checkOut?: string
  guests?: number
  nights?: number
}

interface RoomBookingCardProps {
  price?: number
  currency?: string
  rating?: number
  reviewCount?: number
  discountPrice?: number
  taxes?: number
  serviceFee?: number
  cleaningFee?: number
  isLoading?: boolean
  onBookNow?: (details: BookingDetails) => void
  onReserve?: (details: BookingDetails) => void
}

const RoomBookingCard = ({
  price = 40.18,
  currency = "$",
  rating = 4.8,
  reviewCount = 127,
  discountPrice,
  taxes = 8.50,
  serviceFee = 12.30,
  cleaningFee = 15.00,
  isLoading = false,
  onBookNow,
  onReserve
}: RoomBookingCardProps) => {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    checkIn: "",
    checkOut: "",
    guests: 2,
    nights: 1
  })

  const subtotal = price * (bookingDetails.nights || 1)
  const totalBeforeTaxes = subtotal + serviceFee + cleaningFee
  const totalPrice = totalBeforeTaxes + taxes

  const handleBookNow = () => {
    if (onBookNow) {
      onBookNow(bookingDetails)
    } else {
      console.log('Booking initiated:', bookingDetails)
    }
  }

  const handleReserve = () => {
    if (onReserve) {
      onReserve(bookingDetails)
    } else {
      console.log('Reservation initiated:', bookingDetails)
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full animate-pulse sticky top-24">
        <CardHeader>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full sticky top-24 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
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
            {discountPrice && (
              <Badge variant="destructive" className="mt-1">
                Save {currency}{(price - discountPrice).toFixed(2)}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{rating}</span>
            <span className="text-sm text-muted-foreground">({reviewCount})</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-2">
          <div className="border rounded-lg p-3">
            <label className="text-xs font-medium text-muted-foreground">CHECK-IN</label>
            <input
              type="date"
              value={bookingDetails.checkIn}
              onChange={(e) => setBookingDetails(prev => ({ ...prev, checkIn: e.target.value }))}
              className="w-full text-sm font-medium bg-transparent border-none p-0 focus:outline-none"
              placeholder="Add date"
            />
          </div>
          <div className="border rounded-lg p-3">
            <label className="text-xs font-medium text-muted-foreground">CHECK-OUT</label>
            <input
              type="date"
              value={bookingDetails.checkOut}
              onChange={(e) => setBookingDetails(prev => ({ ...prev, checkOut: e.target.value }))}
              className="w-full text-sm font-medium bg-transparent border-none p-0 focus:outline-none"
              placeholder="Add date"
            />
          </div>
        </div>

        {/* Guests Selection */}
        <div className="border rounded-lg p-3">
          <label className="text-xs font-medium text-muted-foreground">GUESTS</label>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{bookingDetails.guests} guests</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBookingDetails(prev => ({
                  ...prev,
                  guests: Math.max(1, (prev.guests || 1) - 1)
                }))}
              >
                -
              </Button>
              <Button
                variant="outline"
                size="sm"
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

        {/* Primary CTA */}
        <Button
          onClick={handleBookNow}
          className="w-full h-12 text-lg font-semibold"
          size="lg"
        >
          Book Now
        </Button>

        {/* Secondary CTA */}
        <Button
          onClick={handleReserve}
          variant="outline"
          className="w-full"
        >
          Reserve (Pay Later)
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          You won't be charged yet
        </p>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-3">
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
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{currency}{totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-4 pt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Secure booking</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Free cancellation</span>
          </div>
          <div className="flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            <span>Pay later option</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RoomBookingCard