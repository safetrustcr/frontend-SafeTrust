"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Wifi,
  Car,
  Coffee,
  Tv,
  Wind,
  Waves,
  Utensils,
  Dumbbell,
  Bed,
  Bath,
  Users,
  Snowflake,
  ChevronDown,
  ChevronUp
} from "lucide-react"

interface Amenity {
  id: string
  name: string
  icon: React.ReactNode
  category: "comfort" | "connectivity" | "entertainment" | "facilities" | "room"
  description?: string
}

interface AmenitiesCardProps {
  amenities?: Amenity[]
  isLoading?: boolean
}

const defaultAmenities: Amenity[] = [
  { id: "bed", name: "2 Beds", icon: <Bed className="w-4 h-4" />, category: "room", description: "Comfortable queen-size beds with premium bedding" },
  { id: "bath", name: "1 Bathroom", icon: <Bath className="w-4 h-4" />, category: "room", description: "Full bathroom with shower and premium amenities" },
  { id: "guests", name: "4 Guests", icon: <Users className="w-4 h-4" />, category: "room", description: "Accommodates up to 4 guests comfortably" },
  { id: "wifi", name: "Free WiFi", icon: <Wifi className="w-4 h-4" />, category: "connectivity", description: "High-speed internet access throughout the property" },
  { id: "parking", name: "Free Parking", icon: <Car className="w-4 h-4" />, category: "facilities", description: "Complimentary on-site parking available" },
  { id: "breakfast", name: "Breakfast", icon: <Coffee className="w-4 h-4" />, category: "facilities", description: "Continental breakfast included with your stay" },
  { id: "tv", name: "Smart TV", icon: <Tv className="w-4 h-4" />, category: "entertainment", description: "55-inch smart TV with streaming services" },
  { id: "ac", name: "Air Conditioning", icon: <Snowflake className="w-4 h-4" />, category: "comfort", description: "Individual climate control in each room" },
  { id: "pool", name: "Swimming Pool", icon: <Waves className="w-4 h-4" />, category: "facilities", description: "Outdoor swimming pool open year-round" },
  { id: "restaurant", name: "Restaurant", icon: <Utensils className="w-4 h-4" />, category: "facilities", description: "On-site restaurant serving local and international cuisine" },
  { id: "gym", name: "Fitness Center", icon: <Dumbbell className="w-4 h-4" />, category: "facilities", description: "24/7 access to modern fitness equipment" },
  { id: "balcony", name: "Balcony", icon: <Wind className="w-4 h-4" />, category: "comfort", description: "Private balcony with city or garden views" }
]

const categoryColors = {
  room: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  comfort: "bg-green-100 text-green-800 hover:bg-green-200",
  connectivity: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  entertainment: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  facilities: "bg-gray-100 text-gray-800 hover:bg-gray-200"
}

const AmenitiesCard = ({
  amenities = defaultAmenities,
  isLoading = false
}: AmenitiesCardProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    room: true,
    facilities: true,
    comfort: false,
    connectivity: false,
    entertainment: false
  })

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  if (isLoading) {
    return (
      <Card className="w-full animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-8 bg-gray-200 rounded-full"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const groupedAmenities = amenities.reduce((acc, amenity) => {
    if (!acc[amenity.category]) {
      acc[amenity.category] = []
    }
    acc[amenity.category].push(amenity)
    return acc
  }, {} as Record<string, Amenity[]>)

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "room": return "Room Features"
      case "connectivity": return "Connectivity"
      case "entertainment": return "Entertainment"
      case "facilities": return "Hotel Facilities"
      case "comfort": return "Comfort & Climate"
      default: return category
    }
  }

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(groupedAmenities).map(([category, categoryAmenities]) => (
              <div key={category}>
                <Button
                  variant="ghost"
                  onClick={() => toggleCategory(category)}
                  className="w-full justify-between p-0 h-auto font-medium text-muted-foreground hover:text-foreground"
                >
                  <span className="text-sm capitalize">
                    {getCategoryTitle(category)} ({categoryAmenities.length})
                  </span>
                  {expandedCategories[category] ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>

                {expandedCategories[category] && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {categoryAmenities.map((amenity) => (
                      <Tooltip key={amenity.id}>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="secondary"
                            className={`${categoryColors[amenity.category]} flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 cursor-help justify-start hover:scale-105 hover:shadow-sm`}
                          >
                            {amenity.icon}
                            <span className="text-sm font-medium">{amenity.name}</span>
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p>{amenity.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

export default AmenitiesCard