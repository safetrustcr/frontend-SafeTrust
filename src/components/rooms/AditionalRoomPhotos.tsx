"use client"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

interface AditionalRoomPhotosProps {
  images: string[]
  className?: string
  onImageClick?: (index: number) => void
}

const AditionalRoomPhotos = ({
  images = [
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
  ],
  className = "",
  onImageClick,
}: AditionalRoomPhotosProps) => {
  return (
    <Card className={`border-none shadow-none h-full ${className}`}>
      <CardContent className="p-0 h-full">
        <div className="flex flex-col gap-2 h-full justify-between">
          {images.slice(0, 3).map((image, index) => (
            <button
              key={index}
              onClick={() => onImageClick && onImageClick(index)}
              className="relative overflow-hidden rounded-lg border flex-1 hover:opacity-90 transition-opacity"
              style={{ height: "calc(33.33% - 0.5rem)" }}
            >
              <Image src={image || "/placeholder.svg"} alt={`Room view ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default AditionalRoomPhotos

