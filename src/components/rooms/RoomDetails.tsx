"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Bed, Bath } from "lucide-react"
import {
  RoomDetailsCard,
  AmenitiesCard,
  LocationCard,
  HostCard,
  PolicyCard
} from "./cards"

export interface RoomDetailsInfo {
  hotelName: string
  address: string
  beds: number
  baths: number
  mapImageSrc: string
  detailsDescription: string
  payment: {
    priceLabel: string
    locationTag: string
    propertyTitle: string
    monthlyAmount: number
    occupancyTaxes: number
    totalPerMonth: number
    depositAmount: number
    billingDescription: string
    depositStatusText: string
    rentalStatusText: string
  }
}

interface RoomDetailsProps {
  info?: RoomDetailsInfo
  isLoading?: boolean
}

const RoomDetails = ({ info, isLoading = false }: RoomDetailsProps) => {
  // If info is provided, use the simple card layout
  if (info) {
    return (
      <Card className="w-full border-none shadow-none">
        <CardContent className="p-0">
          <div className="space-y-4">
            {/* Hotel Name and Price */}
            <div className="relative">
              <h2 className="text-2xl font-semibold">{info.hotelName}</h2>
              <div className="absolute top-0 right-3">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  {info.payment.priceLabel}
                </Button>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
                <MapPin className="w-3 h-3" />
              </div>
              <span className="text-sm text-gray-600">{info.address}</span>
            </div>

            {/* Amenities */}
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
                  <Bed className="w-3 h-3" />
                </div>
                <span className="text-sm text-gray-600">{info.beds} bed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
                  <Bath className="w-3 h-3" />
                </div>
                <span className="text-sm text-gray-600">{info.baths} bathroom</span>
              </div>
            </div>

            {/* Hotel Details and Map - Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Hotel Details */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Hotel details</h3>
                <p className="text-sm text-gray-600">
                  {info.detailsDescription}
                </p>
              </div>

              {/* Map */}
              <div className="relative h-32 overflow-hidden rounded-md">
                <Image
                  src={info.mapImageSrc}
                  alt="Hotel location map"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Otherwise use the card-based layout
  const handleBookNow = () => {
    console.log('Booking initiated')
  }

  const handleContactHost = () => {
    console.log('Contact host clicked')
  }

  const handleGetDirections = () => {
    console.log('Get directions clicked')
  }

  const handleViewOnMap = () => {
    console.log('View on map clicked')
  }

  return (
    <div className="space-y-6">
      {/* Main Room Details */}
      <RoomDetailsCard
        isLoading={isLoading}
        onBookNow={handleBookNow}
      />

      {/* Amenities */}
      <AmenitiesCard isLoading={isLoading} />

      {/* Location */}
      <LocationCard
        isLoading={isLoading}
        onGetDirections={handleGetDirections}
        onViewOnMap={handleViewOnMap}
      />

      {/* Host Information */}
      <HostCard
        isLoading={isLoading}
        onContactHost={handleContactHost}
      />

      {/* Policies and Rules */}
      <PolicyCard isLoading={isLoading} />
    </div>
  )
}

export default RoomDetails
