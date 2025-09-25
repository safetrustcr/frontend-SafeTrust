"use client"

import { useState } from "react"
import RoomPhotos from "@/components/rooms/RoomPhotos"
import AditionalRoomPhotos from "@/components/rooms/AditionalRoomPhotos"
import {
  RoomBookingCard,
  RoomDetailsCard,
  RoomActionBar,
  MobileBookingCard,
  MobileRoomGallery
} from "./components"
import {
  AmenitiesCard,
  LocationCard,
  HostCard,
  PolicyCard
} from "@/components/rooms/cards"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Share, Heart } from "lucide-react"
import { NavigationHeader } from "@/components/navigation/NavigationHeader";

const additionalImages = [
  "/img/room1.png",
  "/img/room2.png",
  "/img/hotel/hotel1.jpg"
]
const breadcrumbs = [
  { label: "Search", href: "/dashboard/search" },
  { label: "Shikara Hotel", isCurrentPage: true },
];

export default function RoomPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [mobileBookingOpen, setMobileBookingOpen] = useState(false)

  const handleBookingClick = () => {
    setMobileBookingOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 max-w-7xl">
          <NavigationHeader
            breadcrumbs={breadcrumbs}
            backButtonFallback="/search"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <h1 className="text-2xl font-bold mb-2">Room Gallery</h1>
        {/* Photo Gallery Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

            {/* Main Room Photos */}
            <div className="lg:col-span-8">
              <RoomPhotos />
            </div>

            {/* Additional Hotel Images */}
            <div className="lg:col-span-4">
              <AditionalRoomPhotos images={additionalImages} />
            </div>
          </div>
        </div>

        {/* Room Information Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main content - Room Details */}
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
      {/* <MobileRoomGallery />  */}
      <MobileBookingCard
        isOpen={mobileBookingOpen}
        onClose={() => setMobileBookingOpen(false)}
      />
    </div>
  )
}