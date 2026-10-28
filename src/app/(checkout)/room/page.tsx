"use client";

export const dynamic = "force-dynamic";

import { useRef, useState } from "react";
import nextDynamic from "next/dynamic";
import RoomDetailsCard from "@/components/rooms/cards/RoomDetailsCard";
import { usePathname, useRouter } from "next/navigation";
import { parseISO } from "date-fns";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";
import { PageContainer } from "@/components/layouts/PageContainer";
import { PageHeader } from "@/components/layouts/PageHeader";
import { getApartmentById } from "@/lib/mockData/apartmentListings";
import { ListingMapDialog } from "@/components/rooms/ListingMapDialog";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { directionsUrl, isValidCoordinate } from "@/lib/geo";
import { loginHref } from "@/components/navigation/account-routes";
import type { BookingDetails } from "@/features/escrow/booking-escrow.machine";

const RoomBookingPanel = nextDynamic(
  () => import("@/components/rooms/booking/RoomBookingPanel"),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        aria-label="Loading booking"
        className="h-[420px] animate-pulse rounded-lg bg-muted"
      />
    ),
  },
);

const RoomPhotos = nextDynamic(
  () => import("@/components/rooms/gallery/RoomPhotos"),
);
const AdditionalRoomPhotos = nextDynamic(
  () => import("@/components/rooms/gallery/AdditionalRoomPhotos"),
);
const RoomActionBar = nextDynamic(
  () => import("@/components/rooms/actions/RoomActionBar"),
);
const MobileBookingCard = nextDynamic(
  () => import("@/components/rooms/booking/MobileBookingCard"),
);
const BookingConfirmation = nextDynamic(() =>
  import("@/components/rooms/booking/BookingConfirmation").then(
    (module) => module.BookingConfirmation,
  ),
);
const AmenitiesCard = nextDynamic(
  () => import("@/components/rooms/cards/AmenitiesCard"),
);
const LocationCard = nextDynamic(
  () => import("@/components/rooms/cards/LocationCard"),
);
const HostCard = nextDynamic(() => import("@/components/rooms/cards/HostCard"));
const PolicyCard = nextDynamic(
  () => import("@/components/rooms/cards/PolicyCard"),
);

const roomListing = getApartmentById("1");
const additionalImages = roomListing.images.slice(1);

// Static demo room: no dynamic hotel id is available on /room yet.
// Keep the id explicit here so the booking link does not silently drift.
const hotelId = "1";
const listing = getApartmentById(hotelId);
// Nightly rate for the demo room (kept small for testnet walkthroughs).
const NIGHTLY_RATE = 2;

const breadcrumbs = [
  { label: "Search", href: "/rent" },
  { label: listing.name, isCurrentPage: true },
];

export default function RoomPage() {
  const router = useRouter();
  const [isLoading] = useState(false);
  const [mobileBookingOpen, setMobileBookingOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const mapTriggerRef = useRef<HTMLElement | null>(null);
  const { user, loading } = useCurrentUser();
  const pathname = usePathname();

  const requireSignIn = (next: () => void) => {
    if (loading) return;
    if (!user) {
      router.push(loginHref(pathname));
      return;
    }
    next();
  };

  const handleLike = () => requireSignIn(() => setIsLiked((liked) => !liked));

  const contactHost = () =>
    requireSignIn(() =>
      router.push(
        `/dashboard/messages/new?listing=${encodeURIComponent(listing.id)}`,
      ),
    );

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
          backButtonFallback="/rent"
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
            listingId={hotelId}
            listingName={listing.name}
            isLiked={isLiked}
            onLike={handleLike}
            onContact={contactHost}
          />
          {/* Amenities */}
          <AmenitiesCard isLoading={isLoading} />
          {/* Location */}
          <LocationCard
            address={roomListing.address}
            city={roomListing.location}
            coordinates={roomListing.coordinates}
            isLoading={isLoading}
            onViewOnMap={(event) => {
              mapTriggerRef.current = event.currentTarget;
              setMapOpen(true);
            }}
            onGetDirections={
              isValidCoordinate(roomListing.coordinates)
                ? () =>
                    window.open(
                      directionsUrl(roomListing.coordinates),
                      "_blank",
                      "noopener,noreferrer",
                    )
                : undefined
            }
          />
          {/* Host Information */}
          <HostCard
            hostName={roomListing.owner.name}
            hostAvatar={roomListing.owner.avatar}
            onContactHost={contactHost}
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
                <RoomBookingPanel
                  roomId="room_001"
                  listing={listing}
                  basePrice={NIGHTLY_RATE}
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
      <ListingMapDialog
        open={mapOpen}
        onOpenChange={setMapOpen}
        returnFocusRef={mapTriggerRef}
        name={listing.name}
        address={roomListing.address}
        coordinates={roomListing.coordinates}
      />
      <MobileBookingCard
        isOpen={mobileBookingOpen}
        onClose={() => setMobileBookingOpen(false)}
      />
    </PageContainer>
  );
}
