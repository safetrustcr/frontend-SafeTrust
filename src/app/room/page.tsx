"use client"

import { useState } from "react"
import RoomPhotos from "@/components/rooms/RoomPhotos"
import RoomDetails from "@/components/rooms/RoomDetails"
import AditionalRoomPhotos from "@/components/rooms/AditionalRoomPhotos"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Share, Heart } from "lucide-react"

const additionalImages = [
  "/img/room1.png?height=195&width=300",
  "/img/room1.png?height=195&width=300",
  "/img/room1.png?height=195&width=300",
]

export default function RoomPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Shikara Hotel',
        text: 'Check out this amazing room!',
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      console.log('Link copied to clipboard')
    }
  }

  const handleSave = () => {
    console.log('Room saved to favorites')
  }

  const handleBack = () => {
    window.history.back()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with navigation */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to search</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Share</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSave}>
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Save</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Photo Gallery Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Main Room Photos - Takes 8 columns on large screens */}
            <div className="lg:col-span-8">
              <RoomPhotos />
            </div>

            {/* Additional Hotel Images - Takes 4 columns on large screens */}
            <div className="lg:col-span-4">
              <AditionalRoomPhotos images={additionalImages} />
            </div>
          </div>
        </div>

        {/* Room Information Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main content - Room Details takes 2/3 of the width on extra large screens */}
          <div className="xl:col-span-2">
            <RoomDetails isLoading={isLoading} />
          </div>

          {/* Sidebar on extra large screens - could be used for booking widget, etc. */}
          <div className="xl:col-span-1">
            <div className="sticky top-24">
              {/* Placeholder for booking widget or additional info */}
              <div className="bg-muted/30 rounded-lg p-6 text-center text-muted-foreground">
                <p className="text-sm">Booking widget or additional information can be placed here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}