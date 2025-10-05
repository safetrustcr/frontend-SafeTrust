"use client"

import * as React from "react"
import { DateRange } from "react-day-picker"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

interface AvailabilityCheckerProps {
  dateRange?: DateRange
  roomId?: string
  onAvailabilityChange?: (isAvailable: boolean) => void
  className?: string
}

interface AvailabilityStatus {
  isAvailable: boolean
  isLoading: boolean
  message?: string
}

const AvailabilityChecker: React.FC<AvailabilityCheckerProps> = ({
  dateRange,
  roomId,
  onAvailabilityChange,
  className
}) => {
  const [availability, setAvailability] = React.useState<AvailabilityStatus>({
    isAvailable: false,
    isLoading: false
  })

  const checkAvailability = React.useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to || !roomId) {
      setAvailability({ isAvailable: false, isLoading: false })
      onAvailabilityChange?.(false)
      return
    }

    setAvailability({ isAvailable: false, isLoading: true })

    try {
      // Simulate API call - replace with actual availability check
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock availability logic - in real implementation, this would be an API call
      const isAvailable = Math.random() > 0.3 // 70% chance of being available
      
      const newAvailability = {
        isAvailable,
        isLoading: false,
        message: isAvailable 
          ? "Room is available for selected dates" 
          : "Room is not available for selected dates"
      }
      
      setAvailability(newAvailability)
      onAvailabilityChange?.(isAvailable)
    } catch (error) {
      setAvailability({
        isAvailable: false,
        isLoading: false,
        message: "Error checking availability"
      })
      onAvailabilityChange?.(false)
    }
  }, [dateRange, roomId, onAvailabilityChange])

  React.useEffect(() => {
    checkAvailability()
  }, [checkAvailability])

  if (!dateRange?.from || !dateRange?.to) {
    return (
      <div className={className}>
        <div className="text-sm text-muted-foreground">
          Select dates to check availability
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center space-x-2">
        {availability.isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-muted-foreground">Checking availability...</span>
          </>
        ) : availability.isAvailable ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">
              {availability.message}
            </span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-600 font-medium">
              {availability.message}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

export { AvailabilityChecker }
export type { AvailabilityCheckerProps, AvailabilityStatus }
