"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import {
  RoomPhotos,
  AdditionalRoomPhotos,
  RoomDetailsCard,
  RoomActionBar,
  MobileBookingCard,
  RoomBookingCard,
  BookingConfirmation,
  AmenitiesCard,
  LocationCard,
  HostCard,
  PolicyCard,
} from "@/components/rooms";
import { useRouter } from "next/navigation";
import { parseISO } from "date-fns";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";
import { PageContainer } from "@/components/layouts/PageContainer";
import { PageHeader } from "@/components/layouts/PageHeader";
import { getApartmentById } from "@/lib/mockData/apartmentListings";
import { EscrowProviders } from "@/providers/EscrowProviders";
import type { BookingDetails } from "@/features/escrow/booking-escrow.machine";

const roomListing = getApartmentById("1");
const additionalImages = roomListing.images.slice(1);

// Static demo room: no dynamic hotel id is available on /room yet.
// Keep the id explicit here so the booking link does not silently drift.
const hotelId = "1";
const listing = getApartmentById(hotelId);
// Nightly rate for the demo room (kept small for testnet walkthroughs).
const NIGHTLY_RATE = 2;

const breadcrumbs = [
  { label: "Search", href: "/dashboard/search" },
  { label: listing.name, isCurrentPage: true },
];

export default function RoomPage() {
  const router = useRouter();
  const [isLoading] = useState(false);
  const [mobileBookingOpen, setMobileBookingOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(24);

  // Simulated auth state
  const isAuthenticated = false;

  const handleLike = () => {
    if (!isAuthenticated) {
      alert("Please login to save this room");
      return;
    }
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      alert("Please login to contact the host");
      return;
    }
    console.log("Contact form opened");
  };

  const handleReport = () => {
    if (!isAuthenticated) {
      alert("Please login to report this listing");
      return;
    }
    console.log("Report form opened");
  };

  const [bookingData, setBookingData] = useState<{
    bookingId: string;
    checkIn: Date;
    checkOut: Date;
    guestCount: number;
    totalPrice: number;
  } | null>(null);

  const handleBookingStart = () => {
    console.log("Booking process started");
  };

  const handleBookingComplete = (
    bookingId: string,
    booking: BookingDetails,
  ) => {
    setBookingData({
      bookingId,
      checkIn: parseISO(booking.checkIn),
      checkOut: parseISO(booking.checkOut),
      guestCount: booking.price.guests,
      totalPrice: booking.price.total,
    });
  };

  const handleBookingError = (error: string) => {
    console.error("Booking error:", error);
  };

  const handleViewBooking = () => {
    if (bookingData) {
      router.push(`/hotels/${hotelId}/book?bookingId=${bookingData.bookingId}`);
    }
  };

  return (
    <PageContainer className="min-h-screen bg-background pb-8">
      {/* Navigation/Page Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <NavigationHeader
          breadcrumbs={breadcrumbs}
          backButtonFallback="/search"
        />
      </div>

      {/* Main content */}
      <PageHeader title="Room Gallery" />

      {/* 1. Photo Gallery Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Main Room Photos */}
        <div className="lg:col-span-8 space-y-6 px-2 md:px-6">
          <RoomPhotos images={roomListing.images} />
        </div>

        {/* Additional Hotel Images */}
        <div className="lg:col-span-4">
          <AdditionalRoomPhotos images={additionalImages} />
        </div>
      </div>

      {/* 2. Room Information Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main content - Room Details */}
        <div className="xl:col-span-2 space-y-8">
          {/* Room Basic Details */}
          <RoomDetailsCard hotelName={listing.name} isLoading={isLoading} />
          {/* Action Bar */}
          <RoomActionBar
            isLiked={isLiked}
            likeCount={likeCount}
            onLike={handleLike}
            onContact={handleContact}
            onReport={handleReport}
          />
          {/* Amenities */}
          <AmenitiesCard isLoading={isLoading} />
          {/* Location */}
          <LocationCard
            address={roomListing.address}
            city={roomListing.location}
            coordinates={roomListing.coordinates}
            isLoading={isLoading}
          />
          {/* Host Information */}
          <HostCard
            hostName={roomListing.owner.name}
            hostAvatar={roomListing.owner.avatar}
            isLoading={isLoading}
          />
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
                  hotelName={listing.name}
                  hotelId={hotelId}
                  checkIn={bookingData.checkIn}
                  checkOut={bookingData.checkOut}
                  guestCount={bookingData.guestCount}
                  totalPrice={bookingData.totalPrice}
                  onViewBooking={handleViewBooking}
                />
              ) : (
                <EscrowProviders>
                  <RoomBookingCard
                    roomId="room_001"
                    listing={listing}
                    basePrice={NIGHTLY_RATE}
                    onBookingStart={handleBookingStart}
                    onBookingComplete={handleBookingComplete}
                    onBookingError={handleBookingError}
                  />
                </EscrowProviders>
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
    </PageContainer>
  );
}
