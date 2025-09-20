"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, MapPin, Users, DollarSign, Copy } from "lucide-react"
import { useRouter } from "next/navigation"

interface BookingConfirmationProps {
  bookingId: string
  hotelName: string
  checkIn: Date
  checkOut: Date
  guestCount: number
  totalPrice: number
  onViewBooking?: () => void
  className?: string
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  bookingId,
  hotelName,
  checkIn,
  checkOut,
  guestCount,
  totalPrice,
  onViewBooking,
  className
}) => {
  const router = useRouter()

  const handleViewBooking = () => {
    if (onViewBooking) {
      onViewBooking()
    } else {
      router.push(`/dashboard/hotel/payment?bookingId=${bookingId}`)
    }
  }

  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <Card className={`!rounded-3xl !shadow-none border-black/10 w-full max-w-md ${className}`}>
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle strokeWidth={1} className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-xl text-green-600">Booking Confirmed!</CardTitle>
        <p className="text-sm text-muted-foreground">
          Your reservation has been secured with SafeTrust escrow
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{hotelName}</p>
              <p className="text-xs text-muted-foreground">
                {checkIn.toLocaleDateString()} - {checkOut.toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{nights} night{nights > 1 ? 's' : ''}</p>
              <p className="text-xs text-muted-foreground">
                {guestCount} guest{guestCount > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign strokeWidth={1} className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Total Paid</p>
              <p className="text-xs text-muted-foreground">
                ${totalPrice.toFixed(2)} (secured in escrow)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg overflow-hidden">
          <p className="text-xs text-muted-foreground flex items-center gap-2">Booking ID <Copy className="w-3 h-3" onClick={() => navigator.clipboard.writeText(bookingId)} /></p>
          <p className="text-sm font-mono truncate">{bookingId}</p>
        </div>

        <div className="space-y-2 pt-4">
          <Button onClick={handleViewBooking} className="w-full cursor-pointer rounded-3xl h-12">
            View Booking Details
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard')} className="w-full cursor-pointer rounded-3xl h-12">
            Back to Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export { BookingConfirmation }
export type { BookingConfirmationProps }
