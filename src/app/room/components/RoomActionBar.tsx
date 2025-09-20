"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Share, Heart, MessageCircle, Shield, Phone, Flag, Star } from "lucide-react"

interface RoomActionBarProps {
  isLiked?: boolean
  likeCount?: number
  onShare?: () => void
  onLike?: () => void
  onContact?: () => void
  onReport?: () => void
  onCall?: () => void
  showTrustBadges?: boolean
  className?: string
}

const RoomActionBar = ({
  isLiked = false,
  likeCount = 24,
  onShare,
  onLike,
  onContact,
  onReport,
  onCall,
  showTrustBadges = true,
  className = ""
}: RoomActionBarProps) => {
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

  const handleLike = () => {
    if (onLike) {
      onLike()
    } else {
      console.log('Room liked/unliked')
    }
  }

  const handleContact = () => {
    if (onContact) {
      onContact()
    } else {
      console.log('Contact host clicked')
    }
  }

  const handleReport = () => {
    if (onReport) {
      onReport()
    } else {
      console.log('Report listing clicked')
    }
  }

  const handleCall = () => {
    if (onCall) {
      onCall()
    } else {
      console.log('Call host clicked')
    }
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Primary Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLike}
            className={`flex items-center gap-2 ${
              isLiked ? 'text-red-500 border-red-200 bg-red-50' : ''
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
            <span className="hidden sm:inline">
              {isLiked ? 'Saved' : 'Save'}
            </span>
            {likeCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {likeCount}
              </Badge>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleContact}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Contact Host</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCall}
            className="flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">Call</span>
          </Button>
        </div>
      </div>

      {/* Trust & Safety */}
      {showTrustBadges && (
        <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-4 bg-muted/30 rounded-lg">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-green-600">
              <Shield className="w-4 h-4" />
              <span>Verified Host</span>
            </div>
            <div className="flex items-center gap-2 text-blue-600">
              <Star className="w-4 h-4" />
              <span>Superhost</span>
            </div>
            <div className="flex items-center gap-2 text-purple-600">
              <Shield className="w-4 h-4" />
              <span>Identity Verified</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReport}
            className="text-muted-foreground hover:text-foreground"
          >
            <Flag className="w-4 h-4 mr-2" />
            Report this listing
          </Button>
        </div>
      )}

      {/* Mobile Actions */}
      <div className="flex sm:hidden gap-2">
        <Button variant="outline" size="sm" onClick={handleShare} className="flex-1">
          <Share className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLike}
          className={`flex-1 ${isLiked ? 'text-red-500 border-red-200 bg-red-50' : ''}`}
        >
          <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-red-500' : ''}`} />
          {isLiked ? 'Saved' : 'Save'}
        </Button>
        <Button variant="outline" size="sm" onClick={handleContact} className="flex-1">
          <MessageCircle className="w-4 h-4 mr-2" />
          Contact
        </Button>
      </div>
    </div>
  )
}

export default RoomActionBar