"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Grid, Maximize } from "lucide-react"

interface RoomImageGalleryProps {
  images?: string[]
  className?: string
  onImageClick?: (index: number) => void
  onViewAllPhotos?: () => void
}

const defaultImages = [
  "/img/room1.png",
  "/img/room2.png",
  "/img/hotel/hotel1.jpg",
  "/img/room2.png",
  "/img/room1.png",
  "/img/hotel/hotel1.jpg"
]

const RoomImageGallery = ({
  images = defaultImages,
  className = "",
  onImageClick,
  onViewAllPhotos
}: RoomImageGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handlePrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    )
  }

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    )
  }

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index)
    if (onImageClick) {
      onImageClick(index)
    }
  }

  const handleViewAllPhotos = () => {
    if (onViewAllPhotos) {
      onViewAllPhotos()
    } else {
      console.log('View all photos clicked')
    }
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-4 ${className}`}>
      {/* Main Image */}
      <div className="lg:col-span-8 relative">
        <Card className="w-full border-none shadow-none overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border group">
              <Image
                src={images[currentImageIndex] || "/placeholder.svg"}
                alt={`Room view ${currentImageIndex + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority
              />

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                    onClick={handleNext}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Image counter */}
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>

              {/* View all photos button */}
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                onClick={handleViewAllPhotos}
              >
                <Grid className="w-4 h-4 mr-2" />
                View all photos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Thumbnail Grid */}
      <div className="lg:col-span-4">
        <Card className="border-none shadow-none h-full">
          <CardContent className="p-0 h-full">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 h-full">
              {images.slice(1, 5).map((image, index) => {
                const actualIndex = index + 1
                return (
                  <button
                    key={actualIndex}
                    onClick={() => handleImageClick(actualIndex)}
                    className={`relative overflow-hidden rounded-lg border-2 transition-all hover:border-primary aspect-square lg:aspect-auto lg:h-[calc(75%-0.375rem)] ${
                      actualIndex === currentImageIndex ? 'border-primary' : 'border-transparent'
                    } ${index === 3 ? 'relative' : ''}`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Room view ${actualIndex + 1}`}
                      fill
                      className="object-cover transition-transform hover:scale-105"
                    />
                    {/* Show "+X more" overlay on the last thumbnail */}
                    {index === 3 && images.length > 5 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="text-white font-semibold flex items-center gap-2">
                          <Maximize className="w-4 h-4" />
                          +{images.length - 5} more
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RoomImageGallery