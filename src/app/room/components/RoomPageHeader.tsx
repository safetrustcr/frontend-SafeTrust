"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Share, Heart } from "lucide-react"

interface RoomPageHeaderProps {
  onBack?: () => void
  onShare?: () => void
  onSave?: () => void
}

const RoomPageHeader = ({
  onBack,
  onShare,
  onSave
}: RoomPageHeaderProps) => {
  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  const handleShare = () => {
    if (onShare) {
      onShare()
    } else {
      if (typeof window !== 'undefined') {
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
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave()
    } else {
      console.log('Room saved to favorites')
    }
  }

  return (
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
  )
}

export default RoomPageHeader