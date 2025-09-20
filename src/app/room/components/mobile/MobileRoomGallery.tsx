"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Grid, X, ChevronLeft, ChevronRight } from "lucide-react"

interface MobileRoomGalleryProps {
  images?: string[]
  isOpen?: boolean
  onClose?: () => void
  initialImageIndex?: number
}

const defaultImages = [
  "/img/room1.png",
  "/img/room2.png",
  "/img/room1.png",
  "/img/room2.png",
  "/img/room1.png",
  "/img/room2.png"
]

const MobileRoomGallery = ({
  images = defaultImages,
  isOpen = false,
  onClose,
  initialImageIndex = 0
}: MobileRoomGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialImageIndex)
  const [showControls, setShowControls] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    setCurrentImageIndex(initialImageIndex)
  }, [initialImageIndex])

  useEffect(() => {
    if (showControls) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [showControls])

  const handlePrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    )
    setShowControls(true)
  }

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    )
    setShowControls(true)
  }

  const handleImageTap = () => {
    setShowControls(!showControls)
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black md:hidden">
      {/* Header */}
      <div
        className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="text-white hover:bg-white/20"
        >
          <X className="w-6 h-6" />
        </Button>

        <div className="text-white font-medium">
          {currentImageIndex + 1} / {images.length}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
        >
          <Grid className="w-6 h-6" />
        </Button>
      </div>

      {/* Main Image */}
      <div className="relative w-full h-full">
        <Image
          src={images[currentImageIndex] || "/placeholder.svg"}
          alt={`Room view ${currentImageIndex + 1}`}
          fill
          className="object-contain"
          priority
          onClick={handleImageTap}
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className={`absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={handlePrevious}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={handleNext}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          </>
        )}
      </div>

      {/* Bottom dots indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentImageIndex(index)
              setShowControls(true)
            }}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentImageIndex ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Swipe hint */}
      {showControls && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/70 text-sm">
          Swipe to browse photos
        </div>
      )}
    </div>
  )
}

export default MobileRoomGallery