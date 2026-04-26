"use client"

import * as React from "react"
import { DateRange } from "react-day-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CustomDateRangePicker } from "./CustomDateRangePicker"
import { PriceCalculator } from "./PriceCalculator"
import { AvailabilityChecker } from "./AvailabilityChecker"
import { BookingButton } from "./BookingButton"
import { Users, Calendar } from "lucide-react"

interface RoomBookingCardProps {
  roomId?: string
  basePrice: number
  onBookingStart?: () => void
  onBookingComplete?: (bookingId: string) => void
  onBookingError?: (error: string) => void
  className?: string
}

const RoomBookingCard: React.FC<RoomBookingCardProps> = ({
  roomId,
  basePrice,
  onBookingStart,
  onBookingComplete,
  onBookingError,
  className
}) => {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>()
  const [guestCount, setGuestCount] = React.useState(1)
  const [isAvailable, setIsAvailable] = React.useState(false)
  const [totalPrice, setTotalPrice] = React.useState(0)

  React.useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const nights = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
      const subtotal = basePrice * nights * guestCount
      const tax = subtotal * 0.1
      const platformFee = subtotal * 0.05
      setTotalPrice(subtotal + tax + platformFee)
    } else {
      setTotalPrice(0)
    }
  }, [dateRange, guestCount, basePrice])

  const handleAvailabilityChange = (available: boolean) => {
    setIsAvailable(available)
  }

  const handleBookingStart = () => {
    onBookingStart?.()
  }

  const handleBookingComplete = (bookingId: string) => {
    onBookingComplete?.(bookingId)
  }

  const handleBookingError = (error: string) => {
    onBookingError?.(error)
  }

  return (
    <Card className={`w-full max-w-md sticky top-4 !rounded-3xl !shadow-none border-black/10 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <span>Book This Room</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center space-x-2">
            <Calendar strokeWidth={1} className="h-4 w-4" />
            <span>Check-in / Check-out</span>
          </label>
          <CustomDateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
            placeholder="Select your dates"
            minNights={1}
            maxNights={30}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Guests</span>
          </label>
          <Select value={guestCount.toString()} onValueChange={(value) => setGuestCount(parseInt(value))}>
            <SelectTrigger className="w-full h-12 rounded-3xl shadow-none border-black/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-3xl shadow-none border-black/10 py-4 px-3">
              {[1, 2, 3, 4, 5, 6].map((count) => (
                <SelectItem key={count} value={count.toString()} className="rounded-3xl shadow-none border-black/10 py-4 px-4 ">
                  {count} {count === 1 ? 'Guest' : 'Guests'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <AvailabilityChecker
          dateRange={dateRange}
          roomId={roomId}
          onAvailabilityChange={handleAvailabilityChange}
        />

        <PriceCalculator
          basePrice={basePrice}
          dateRange={dateRange}
          guestCount={guestCount}
          className="border-t pt-4"
        />

        <BookingButton
          dateRange={dateRange}
          isAvailable={isAvailable}
          totalPrice={totalPrice}
          onBookingStart={handleBookingStart}
          onBookingComplete={handleBookingComplete}
          onBookingError={handleBookingError}
          className="mt-6"
        />
      </CardContent>
    </Card>
  )
}

export { RoomBookingCard }
export type { RoomBookingCardProps }
