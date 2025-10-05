"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MapPin, Star, Users, Calendar } from "lucide-react"

interface RoomDetailsCardProps {
  hotelName?: string
  price?: number
  currency?: string
  rating?: number
  reviewCount?: number
  location?: string
  description?: string
  maxGuests?: number
  checkIn?: string
  checkOut?: string
  isLoading?: boolean
  onBookNow?: () => void
}

const RoomDetailsCard = ({
  hotelName = "Shikara Hotel",
  price = 40.18,
  currency = "$",
  rating = 4.8,
  reviewCount = 127,
  location = "124 Colte Street, Downtown Center, San José",
  description = "Lorem ipsum is simply random text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  maxGuests = 4,
  checkIn = "3:00 PM",
  checkOut = "11:00 AM",
  isLoading = false,
  onBookNow
}: RoomDetailsCardProps) => {
  if (isLoading) {
    return (
      <Card className="w-full animate-pulse">
        <CardHeader>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold">{hotelName}</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{rating}</span>
                <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
              </div>
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="text-sm">Up to {maxGuests} guests</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {currency}{price}
              <span className="text-sm font-normal text-muted-foreground"> / night</span>
            </div>
            <Button onClick={onBookNow} className="mt-2">
              Book Now
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Location */}
        <div className="flex items-start space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium mb-1">Location</h4>
            <p className="text-sm text-muted-foreground">{location}</p>
          </div>
        </div>

        <Separator />

        {/* Check-in/Check-out */}
        <div className="flex items-start space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium mb-2">Check-in & Check-out</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Check-in: </span>
                <span className="font-medium">{checkIn}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Check-out: </span>
                <span className="font-medium">{checkOut}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Description */}
        <div>
          <h4 className="font-medium mb-3">About this place</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default RoomDetailsCard