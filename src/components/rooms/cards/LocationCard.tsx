"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Navigation, Clock, Car, Train, Plane } from "lucide-react"

interface NearbyPlace {
  name: string
  distance: string
  type: "restaurant" | "attraction" | "transport" | "shopping"
  walkTime?: string
}

interface LocationCardProps {
  address?: string
  city?: string
  country?: string
  coordinates?: { lat: number; lng: number }
  mapImageUrl?: string
  nearbyPlaces?: NearbyPlace[]
  distanceToCenter?: string
  isLoading?: boolean
  onGetDirections?: () => void
  onViewOnMap?: () => void
}

const defaultNearbyPlaces: NearbyPlace[] = [
  { name: "Central Park", distance: "0.2 km", type: "attraction", walkTime: "3 min" },
  { name: "Downtown Mall", distance: "0.5 km", type: "shopping", walkTime: "6 min" },
  { name: "Metro Station", distance: "0.3 km", type: "transport", walkTime: "4 min" },
  { name: "Local Restaurant", distance: "0.1 km", type: "restaurant", walkTime: "1 min" }
]

const typeIcons = {
  restaurant: <Utensils className="w-3 h-3" />,
  attraction: <MapPin className="w-3 h-3" />,
  transport: <Train className="w-3 h-3" />,
  shopping: <Car className="w-3 h-3" />
}

const typeColors = {
  restaurant: "bg-orange-100 text-orange-800",
  attraction: "bg-green-100 text-green-800",
  transport: "bg-blue-100 text-blue-800",
  shopping: "bg-purple-100 text-purple-800"
}

import { Utensils } from "lucide-react"

const LocationCard = ({
  address = "124 Colte Street, Downtown Center",
  city = "San José",
  country = "Costa Rica",
  mapImageUrl = "/img/image 16.png",
  nearbyPlaces = defaultNearbyPlaces,
  distanceToCenter = "2.1 km from city center",
  isLoading = false,
  onGetDirections,
  onViewOnMap
}: LocationCardProps) => {
  if (isLoading) {
    return (
      <Card className="w-full animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Address */}
        <div className="space-y-2">
          <p className="font-medium">{address}</p>
          <p className="text-sm text-muted-foreground">{city}, {country}</p>
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{distanceToCenter}</span>
          </div>
        </div>

        {/* Map */}
        <div className="space-y-3">
          <div className="relative h-48 rounded-lg overflow-hidden border">
            <Image
              src={mapImageUrl}
              alt="Hotel location map"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors cursor-pointer flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                className="opacity-0 hover:opacity-100 transition-opacity"
                onClick={onViewOnMap}
              >
                View on Map
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={onGetDirections}>
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={onViewOnMap}>
              <MapPin className="w-4 h-4 mr-2" />
              View on Map
            </Button>
          </div>
        </div>

        <Separator />

        {/* Nearby Places */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            What's Nearby
          </h4>
          <div className="space-y-3">
            {nearbyPlaces.map((place, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={`${typeColors[place.type]} px-2 py-1`}>
                    {typeIcons[place.type]}
                  </Badge>
                  <div>
                    <p className="font-medium text-sm">{place.name}</p>
                    <p className="text-xs text-muted-foreground">{place.distance}</p>
                  </div>
                </div>
                {place.walkTime && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {place.walkTime} walk
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default LocationCard