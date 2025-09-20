"use client"

import { useState } from "react";
import RoomPhotos from "@/components/rooms/RoomPhotos";
import RoomDetails from "@/components/rooms/RoomDetails";
import AditionalRoomPhotos from "@/components/rooms/AditionalRoomPhotos";
import { RoomBookingCard } from "@/components/rooms/RoomBookingCard";
import { BookingConfirmation } from "@/components/rooms/BookingConfirmation";
import { useRouter } from "next/navigation";

const additionalImages = [
  "/img/room1.png?height=195&width=300",
  "/img/room1.png?height=195&width=300",
  "/img/room1.png?height=195&width=300",
]

export default function RoomPage() {
  const router = useRouter();
  const [isBooking, setIsBooking] = useState(false);
  const [bookingData, setBookingData] = useState<{
    bookingId: string;
    checkIn: Date;
    checkOut: Date;
    guestCount: number;
    totalPrice: number;
  } | null>(null);

  const handleBookingStart = () => {
    setIsBooking(true);
    console.log("Booking process started");
  };

  const handleBookingComplete = (bookingId: string) => {
    setIsBooking(false);
    console.log("Booking completed:", bookingId);
    
    // Store booking data for confirmation display
    setBookingData({
      bookingId,
      checkIn: new Date(), // In real app, this would come from the booking form
      checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days later
      guestCount: 1,
      totalPrice: 120.54 // In real app, this would be calculated
    });
  };

  const handleBookingError = (error: string) => {
    setIsBooking(false);
    console.error("Booking error:", error);
    // Handle error (show toast, etc.)
  };

  const handleViewBooking = () => {
    if (bookingData) {
      router.push(`/dashboard/hotel/payment?bookingId=${bookingData.bookingId}`);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">Room Gallery</h1>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content - Takes 8 columns on desktop */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Room Photos */}
          <RoomPhotos />

          {/* Additional Hotel Images */}
          <AditionalRoomPhotos images={additionalImages} />
          <RoomDetails />
        </div>

        {/* Booking Card - Takes 4 columns on desktop, full width on mobile */}
        <div className="lg:col-span-4">
          {bookingData ? (
            <BookingConfirmation
              bookingId={bookingData.bookingId}
              hotelName="Shikara Hotel"
              checkIn={bookingData.checkIn}
              checkOut={bookingData.checkOut}
              guestCount={bookingData.guestCount}
              totalPrice={bookingData.totalPrice}
              onViewBooking={handleViewBooking}
            />
          ) : (
            <RoomBookingCard
              roomId="room_001"
              basePrice={40.18}
              onBookingStart={handleBookingStart}
              onBookingComplete={handleBookingComplete}
              onBookingError={handleBookingError}
            />
          )}
        </div>
      </div>
    </div>
  );
}
