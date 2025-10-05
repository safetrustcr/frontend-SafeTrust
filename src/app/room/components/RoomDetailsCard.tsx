"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MapPin, Star, Users, Calendar, Bed, Bath, Wifi } from "lucide-react"

interface RoomDetailsCardProps {
  hotelName?: string
  rating?: number
  reviewCount?: number
  location?: string
  description?: string
  maxGuests?: number
  bedrooms?: number
  bathrooms?: number
  checkIn?: string
  checkOut?: string
  amenities?: string[]
  isLoading?: boolean
}

const RoomDetailsCard = ({
  hotelName = "Shikara Hotel",
  rating = 4.8,
  reviewCount = 127,
  location = "124 Colte Street, Downtown Center, San José",
  description = "Lorem ipsum is simply random text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  maxGuests = 4,
  bedrooms = 2,
  bathrooms = 1,
  checkIn = "3:00 PM",
  checkOut = "11:00 AM",
  amenities = ["Free WiFi", "Free Parking", "Air Conditioning"],
  isLoading = false
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
        <div className="space-y-3">
          <CardTitle className="text-2xl font-semibold">{hotelName}</CardTitle>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{rating}</span>
              <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="text-sm">Up to {maxGuests} guests</span>
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Bed className="w-4 h-4" />
              <span className="text-sm">{bedrooms} bedroom{bedrooms > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Bath className="w-4 h-4" />
              <span className="text-sm">{bathrooms} bathroom{bathrooms > 1 ? 's' : ''}</span>
            </div>
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

        {/* Key Amenities Preview */}
        <div className="flex items-start space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
            <Wifi className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium mb-2">Key Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {amenities.slice(0, 3).map((amenity, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  {amenity}
                </span>
              ))}
              {amenities.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{amenities.length - 3} more
                </span>
              )}
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