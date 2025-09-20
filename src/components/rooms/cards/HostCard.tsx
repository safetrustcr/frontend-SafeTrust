"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Star, MessageCircle, Shield, Calendar, Award, Users } from "lucide-react"

interface HostCardProps {
  hostName?: string
  hostAvatar?: string
  hostSince?: string
  rating?: number
  reviewCount?: number
  responseRate?: number
  responseTime?: string
  isVerified?: boolean
  isSuperhost?: boolean
  totalGuests?: number
  languages?: string[]
  bio?: string
  isLoading?: boolean
  onContactHost?: () => void
}

const HostCard = ({
  hostName = "Maria Rodriguez",
  hostAvatar = "/img/host-avatar.jpg",
  hostSince = "2020",
  rating = 4.9,
  reviewCount = 247,
  responseRate = 98,
  responseTime = "within an hour",
  isVerified = true,
  isSuperhost = true,
  totalGuests = 1250,
  languages = ["English", "Spanish", "Portuguese"],
  bio = "Welcome! I'm Maria, a hospitality professional with over 5 years of experience. I love meeting people from around the world and ensuring they have an amazing stay in our beautiful city.",
  isLoading = false,
  onContactHost
}: HostCardProps) => {
  if (isLoading) {
    return (
      <Card className="w-full animate-pulse">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Your Host</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Host Profile */}
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={hostAvatar} alt={hostName} />
            <AvatarFallback className="text-lg font-semibold">
              {getInitials(hostName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg">{hostName}</h3>
              {isVerified && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
              {isSuperhost && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Award className="w-3 h-3 mr-1" />
                  Superhost
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{rating}</span>
                <span>({reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Host since {hostSince}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Host Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-2xl font-bold text-primary">{responseRate}%</p>
            <p className="text-xs text-muted-foreground">Response rate</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">{responseTime}</p>
            <p className="text-xs text-muted-foreground">Response time</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold">{totalGuests.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total guests</p>
          </div>
        </div>

        <Separator />

        {/* Languages */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Languages</h4>
          <div className="flex flex-wrap gap-2">
            {languages.map((language, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {language}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Bio */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">About your host</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
        </div>

        {/* Contact Button */}
        <Button
          className="w-full"
          onClick={onContactHost}
          variant="outline"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Contact Host
        </Button>
      </CardContent>
    </Card>
  )
}

export default HostCard