"use client"

import {
  RoomDetailsCard,
  AmenitiesCard,
  LocationCard,
  HostCard,
  PolicyCard
} from "./cards"

interface RoomDetailsProps {
  isLoading?: boolean
}

const RoomDetails = ({ isLoading = false }: RoomDetailsProps) => {
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
