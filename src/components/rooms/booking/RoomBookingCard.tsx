"use client";

import * as React from "react";
import type { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomDateRangePicker } from "./CustomDateRangePicker";
import { PriceCalculator } from "./PriceCalculator";
import { AvailabilityChecker } from "./AvailabilityChecker";
import { BookingButton, type BookingListing } from "./BookingButton";
import type { BookingDetails } from "@/features/escrow/booking-escrow.machine";
import { Users, Calendar } from "lucide-react";

interface RoomBookingCardProps {
  roomId?: string;
  listing: BookingListing;
  basePrice: number;
  onBookingStart?: () => void;
  onBookingComplete?: (bookingId: string, booking: BookingDetails) => void;
  onBookingError?: (error: string) => void;
  className?: string;
}

const RoomBookingCard: React.FC<RoomBookingCardProps> = ({
  roomId,
  listing,
  basePrice,
  onBookingStart,
  onBookingComplete,
  onBookingError,
  className,
}) => {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [guestCount, setGuestCount] = React.useState(1);
  const [isAvailable, setIsAvailable] = React.useState(false);

  const handleBookingStart = () => {
    onBookingStart?.();
  };

  const handleBookingComplete = (
    bookingId: string,
    booking: BookingDetails,
  ) => {
    onBookingComplete?.(bookingId, booking);
  };

  const handleBookingError = (error: string) => {
    onBookingError?.(error);
  };

  return (
    <Card
      className={`w-full max-w-md sticky top-4 !rounded-3xl !shadow-none border-black/10 ${className}`}
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <span>Book This Room</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center space-x-2">
            <Calendar strokeWidth={1} className="h-4 w-4" />
            <span>Check-in / Check-out</span>
          </label>
          <CustomDateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
            placeholder="Select your dates"
            minNights={1}
            maxNights={30}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Guests</span>
          </label>
          <Select
            value={guestCount.toString()}
            onValueChange={(value) => setGuestCount(parseInt(value))}
          >
            <SelectTrigger className="w-full h-12 rounded-3xl shadow-none border-black/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-3xl shadow-none border-black/10 py-4 px-3">
              {[1, 2, 3, 4, 5, 6].map((count) => (
                <SelectItem
                  key={count}
                  value={count.toString()}
                  className="rounded-3xl shadow-none border-black/10 py-4 px-4"
                >
                  {count} {count === 1 ? "Guest" : "Guests"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <AvailabilityChecker
          dateRange={dateRange}
          roomId={roomId}
          onAvailabilityChange={setIsAvailable}
        />

        <PriceCalculator
          basePrice={basePrice}
          dateRange={dateRange}
          guestCount={guestCount}
          className="border-t pt-4"
        />

        <BookingButton
          listing={listing}
          dateRange={dateRange}
          guestCount={guestCount}
          nightlyRate={basePrice}
          isAvailable={isAvailable}
          onBookingStart={handleBookingStart}
          onBookingComplete={handleBookingComplete}
          onBookingError={handleBookingError}
          className="mt-6"
        />
      </CardContent>
    </Card>
  );
};

export { RoomBookingCard };
export default RoomBookingCard;
export type { RoomBookingCardProps };
