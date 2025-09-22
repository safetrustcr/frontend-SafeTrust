"use client"

import { useState } from "react";
import RoomPhotos from "@/components/rooms/RoomPhotos";
import RoomDetails from "@/components/rooms/RoomDetails";
import AditionalRoomPhotos from "@/components/rooms/AditionalRoomPhotos";
import { RoomBookingCard } from "@/components/rooms/RoomBookingCard";
import { BookingConfirmation } from "@/components/rooms/BookingConfirmation";
import { useRouter } from "next/navigation";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";

const additionalImages = [
  "/img/room1.png?height=195&width=300",
  "/img/room1.png?height=195&width=300",
  "/img/room1.png?height=195&width=300",
]
const breadcrumbs = [
  { label: "Search", href: "/dashboard/search" },
  { label: "Shikara Hotel", isCurrentPage: true },
];

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
    
    setBookingData({
      bookingId,
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      guestCount: 1,
      totalPrice: 120.54
    });
  };

  const handleBookingError = (error: string) => {
    setIsBooking(false);
    console.error("Booking error:", error);
  };

  const handleViewBooking = () => {
    if (bookingData) {
      router.push(`/dashboard/hotel/payment?bookingId=${bookingData.bookingId}`);
    }
  };

  return (
    <div className="container mx-auto pb-8 max-w-7xl">
      <NavigationHeader
        breadcrumbs={breadcrumbs}
        backButtonFallback="/search"
      />
      <h1 className="text-2xl font-bold mb-6">Room Gallery</h1>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <RoomPhotos />

          <AditionalRoomPhotos images={additionalImages} />
          <RoomDetails />
        </div>

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
              basePrice={2}
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
