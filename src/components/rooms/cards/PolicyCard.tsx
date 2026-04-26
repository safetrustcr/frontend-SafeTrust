"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Clock,
  Calendar,
  Ban,
  Check,
  X,
  PawPrint,
  Cigarette,
  Users,
  Volume2,
  ShieldCheck,
  CreditCard,
  ChevronDown,
  ChevronUp
} from "lucide-react"

interface Policy {
  title: string
  description: string
  allowed: boolean
  icon: React.ReactNode
}

interface CancellationPolicy {
  type: "flexible" | "moderate" | "strict"
  freeUntil?: string
  refundPercentage?: number
  description: string
}

interface PolicyCardProps {
  checkInTime?: string
  checkOutTime?: string
  quietHours?: string
  maxGuests?: number
  minimumStay?: number
  cancellationPolicy?: CancellationPolicy
  houseRules?: Policy[]
  securityDeposit?: number
  currency?: string
  isLoading?: boolean
}

const defaultHouseRules: Policy[] = [
  {
    title: "No smoking",
    description: "Smoking is not allowed anywhere on the property",
    allowed: false,
    icon: <Cigarette className="w-4 h-4" />
  },
  {
    title: "Pets allowed",
    description: "Well-behaved pets are welcome with prior approval",
    allowed: true,
    icon: <PawPrint className="w-4 h-4" />
  },
  {
    title: "No parties or events",
    description: "Parties and large gatherings are not permitted",
    allowed: false,
    icon: <Volume2 className="w-4 h-4" />
  },
  {
    title: "Children welcome",
    description: "Children of all ages are welcome",
    allowed: true,
    icon: <Users className="w-4 h-4" />
  }
]

const defaultCancellationPolicy: CancellationPolicy = {
  type: "moderate",
  freeUntil: "5 days before check-in",
  refundPercentage: 50,
  description: "Free cancellation for 48 hours. Cancel before 5 days of your trip for a partial refund."
}

const getPolicyColor = (type: CancellationPolicy["type"]) => {
  switch (type) {
    case "flexible":
      return "bg-green-100 text-green-800"
    case "moderate":
      return "bg-yellow-100 text-yellow-800"
    case "strict":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const PolicyCard = ({
  checkInTime = "3:00 PM",
  checkOutTime = "11:00 AM",
  quietHours = "10:00 PM - 8:00 AM",
  maxGuests = 4,
  minimumStay = 1,
  cancellationPolicy = defaultCancellationPolicy,
  houseRules = defaultHouseRules,
  securityDeposit = 100,
  currency = "$",
  isLoading = false
}: PolicyCardProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    checkin: true,
    requirements: true,
    houseRules: false,
    cancellation: false,
    deposit: false
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }
  if (isLoading) {
    return (
      <Card className="w-full animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          Policies & Rules
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Check-in/Check-out */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={() => toggleSection('checkin')}
            className="w-full justify-between p-0 h-auto font-medium text-muted-foreground hover:text-foreground"
          >
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Check-in & Check-out
            </span>
            {expandedSections.checkin ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>

          {expandedSections.checkin && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Check-in</span>
                  <span className="font-medium">{checkInTime}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Check-out</span>
                  <span className="font-medium">{checkOutTime}</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg text-sm">
                <span className="text-muted-foreground">Quiet hours</span>
                <span className="font-medium">{quietHours}</span>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Stay Requirements */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={() => toggleSection('requirements')}
            className="w-full justify-between p-0 h-auto font-medium text-muted-foreground hover:text-foreground"
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Stay Requirements
            </span>
            {expandedSections.requirements ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>

          {expandedSections.requirements && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">Maximum guests</span>
                <span className="font-medium">{maxGuests} guests</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">Minimum stay</span>
                <span className="font-medium">{minimumStay} night{minimumStay > 1 ? 's' : ''}</span>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* House Rules */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={() => toggleSection('houseRules')}
            className="w-full justify-between p-0 h-auto font-medium text-muted-foreground hover:text-foreground"
          >
            <span>House Rules ({houseRules.length})</span>
            {expandedSections.houseRules ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>

          {expandedSections.houseRules && (
            <div className="space-y-3">
              {houseRules.map((rule, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    rule.allowed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {rule.allowed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {rule.icon}
                      <span className="font-medium text-sm">{rule.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Cancellation Policy */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={() => toggleSection('cancellation')}
            className="w-full justify-between p-0 h-auto font-medium text-muted-foreground hover:text-foreground"
          >
            <span className="flex items-center gap-2">
              <Ban className="w-4 h-4" />
              Cancellation Policy
            </span>
            {expandedSections.cancellation ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>

          {expandedSections.cancellation && (
            <div className="space-y-3">
              <Badge className={`${getPolicyColor(cancellationPolicy.type)} text-sm px-3 py-1`}>
                {cancellationPolicy.type.charAt(0).toUpperCase() + cancellationPolicy.type.slice(1)} cancellation
              </Badge>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {cancellationPolicy.description}
              </p>
              {cancellationPolicy.freeUntil && (
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg text-sm">
                  <span className="text-muted-foreground">Free cancellation until</span>
                  <span className="font-medium">{cancellationPolicy.freeUntil}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Security Deposit */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={() => toggleSection('deposit')}
            className="w-full justify-between p-0 h-auto font-medium text-muted-foreground hover:text-foreground"
          >
            <span className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Security Deposit
            </span>
            {expandedSections.deposit ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>

          {expandedSections.deposit && (
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">
                  Refundable damage deposit
                </span>
                <span className="font-semibold text-primary">
                  {currency}{securityDeposit}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                This deposit will be held on your payment method and released 7 days after checkout, provided there's no damage to the property.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default PolicyCard