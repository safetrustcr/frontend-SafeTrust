"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

const RoomPhotos = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Room images with proper placeholder URLs
  const roomImages = [
    "/img/room1.png?height=600&width=800", // Main large image
    "/img/room1.png?height=150&width=150", // Thumbnail 1
    "/img/room1.png?height=150&width=150", // Thumbnail 2
    "/img/room1.png?height=150&width=150", // Thumbnail 3
  ]

  return (
    <Card className="w-full border-none shadow-none">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Main Image */}
          <div className="flex-1 relative aspect-[4/3] rounded-lg overflow-hidden border">
            <Image
              src={roomImages[selectedImageIndex] || "/placeholder.svg"}
              alt="Room View"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RoomPhotos

