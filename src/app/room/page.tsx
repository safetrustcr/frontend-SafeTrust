"use client"

import { useState } from "react"
import {
  RoomPageHeader,
  RoomImageGallery,
  RoomBookingCard,
  RoomDetailsCard,
  RoomActionBar,
  MobileRoomGallery,
  MobileBookingCard
} from "./components"
import {
  AmenitiesCard,
  LocationCard,
  HostCard,
  PolicyCard
} from "@/components/rooms/cards"
import { Button } from "@/components/ui/button"

const roomImages = [
  "/img/room1.png",
  "/img/room2.png",
  "/img/hotel/hotel1.jpg",
  "/img/room2.png",
  "/img/room1.png",
  "/img/hotel/hotel1.jpg"
]

export default function RoomPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [mobileGalleryOpen, setMobileGalleryOpen] = useState(false)
  const [mobileBookingOpen, setMobileBookingOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
    setMobileGalleryOpen(true)
  }

  const handleViewAllPhotos = () => {
    setMobileGalleryOpen(true)
  }

  const handleBookingClick = () => {
    setMobileBookingOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <RoomPageHeader />

      {/* Main content */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Photo Gallery Section */}
        <div className="mb-8">
          <RoomImageGallery
            images={roomImages}
            onImageClick={handleImageClick}
            onViewAllPhotos={handleViewAllPhotos}
          />
        </div>

        {/* Room Information Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main content - Room Details takes 2/3 of the width on extra large screens */}
          <div className="xl:col-span-2 space-y-8">
            {/* Room Basic Details */}
            <RoomDetailsCard isLoading={isLoading} />

            {/* Action Bar */}
            <RoomActionBar />

            {/* Amenities */}
            <AmenitiesCard isLoading={isLoading} />

            {/* Location */}
            <LocationCard isLoading={isLoading} />

            {/* Host Information */}
            <HostCard isLoading={isLoading} />

            {/* Policies and Rules */}
            <PolicyCard isLoading={isLoading} />
          </div>

          {/* Sidebar - Booking Card */}
          <div className="xl:col-span-1">
            <div className="hidden xl:block sticky top-24">
              <RoomBookingCard isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Booking Button */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold">$40.18</span>
              <span className="text-sm text-muted-foreground">/ night</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-yellow-500">★</span>
              <span>4.8 (127 reviews)</span>
            </div>
          </div>
          <Button
            onClick={handleBookingClick}
            className="px-8 py-3 text-lg font-semibold"
          >
            Reserve
          </Button>
        </div>
      </div>

      {/* Mobile Modals */}
      <MobileRoomGallery
        images={roomImages}
        isOpen={mobileGalleryOpen}
        onClose={() => setMobileGalleryOpen(false)}
        initialImageIndex={selectedImageIndex}
      />

      <MobileBookingCard
        isOpen={mobileBookingOpen}
        onClose={() => setMobileBookingOpen(false)}
      />
    </div>
  )
}