"use client";

import { useState } from "react";
import RoomPhotos from "@/components/rooms/RoomPhotos";
import RoomDetails, { RoomDetailsInfo } from "@/components/rooms/RoomDetails";
import AditionalRoomPhotos from "@/components/rooms/AditionalRoomPhotos";
import { RoomBookingCard } from "@/components/rooms/RoomBookingCard";
import { BookingConfirmation } from "@/components/rooms/BookingConfirmation";
import {   RoomDetailsCard, RoomActionBar, MobileRoomGallery, MobileBookingCard } from "./components";
import { AmenitiesCard, LocationCard, HostCard, PolicyCard
} from "@/components/rooms/cards"
import { useRouter } from "next/navigation";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";
import { Button } from "@/components/ui/button"
import { ArrowLeft, Share, Heart } from "lucide-react"

const additionalImages = [
  "/img/room1.png",
  "/img/room2.png",
  "/img/hotel/hotel1.jpg",
];

const breadcrumbs = [
  { label: "Search", href: "/dashboard/search" },
  { label: "Shikara Hotel", isCurrentPage: true },
];

export default function RoomPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false)
  const [isBooking, setIsBooking] = useState(false);
  const [mobileBookingOpen, setMobileBookingOpen] = useState(false)

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

  const handleBookingClick = () => {
    setMobileBookingOpen(true)
  }

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


   const detailsInfo: RoomDetailsInfo = {
    hotelName: "Shikara Hotel",
    address: "124 Colte Street, Downtown Center, San José",
    beds: 2,
    baths: 1,
    mapImageSrc: "/img/image 16.png?height=195&width=300",
    detailsDescription:
      "Lorem ipsum is simply random text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    payment: {
      priceLabel: "$40.18 / night",
      locationTag: "Limón",
      propertyTitle: "Puerto Viejo House",
      monthlyAmount: 18000,
      occupancyTaxes: 200,
      totalPerMonth: 18200,
      depositAmount: 14000,
      billingDescription: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      depositStatusText: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      rentalStatusText: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    },
  };

  return (
    <div className="container mx-auto pb-8 max-w-7xl min-h-screen bg-background">
      {/* Navigation/Page Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <NavigationHeader
          breadcrumbs={breadcrumbs}
          backButtonFallback="/search"
        />
      </div>

      {/* Main content */}
      <h1 className="px-4 md:px-6 text-2xl font-bold my-4 lg:mb-6">Room Gallery</h1>

      {/* 1. Photo Gallery Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

        {/* Main Room Photos */}
        <div className="lg:col-span-8 space-y-6 px-2 md:px-6">
          <RoomPhotos />
        </div>

        {/* Additional Hotel Images */}
        <div className="lg:col-span-4">
          <AditionalRoomPhotos images={additionalImages} />
        </div>


      </div>

      {/* 2. Room Information Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main content - Room Details */}
        <div className="xl:col-span-2 space-y-8">
          {/* Room Basic Details */}
          <RoomDetailsCard isLoading={isLoading} />
          {/* Action Bar */}
          <RoomActionBar />
          {/* Amenities */}
          <AmenitiesCard isLoading={isLoading} />
          {/* Location */}
          <LocationCard isLoading={isLoading} />
          {/* Host Information */}
          <HostCard isLoading={isLoading} />
          {/* Policies and Rules */}
          <PolicyCard isLoading={isLoading} />
        </div>

        {/* Sidebar - Booking Card */}
        <div className="xl:col-span-1">
          <div className="hidden xl:block sticky top-24">
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
      </div>

      {/* 3. Mobile Modals */}
        {/* <MobileRoomGallery
          images={roomImages}
          isOpen={mobileGalleryOpen}
          onClose={() => setMobileGalleryOpen(false)}
          initialImageIndex={selectedImageIndex}
        /> */}
       <MobileBookingCard
        isOpen={mobileBookingOpen}
        onClose={() => setMobileBookingOpen(false)}
      />

    </div>
  );
}
