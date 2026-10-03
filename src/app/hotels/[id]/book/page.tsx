"use client";

import React, { Suspense, use, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { addDays, format } from "date-fns";
import HotelDetails from "@/components/hotels/payment/HotelDetails";
import ReservationSummary from "@/components/hotels/payment/ReservationSummary";
import { getApartmentById } from "@/lib/mockData/apartmentListings";
import { EscrowProviders } from "@/providers/EscrowProviders";
import type { BookingDetails } from "@/features/escrow/booking-escrow.machine";
import { computeBookingPrice } from "@/features/escrow/pricing";

// Mock stay shown when this booking has no escrow intent in this session yet.
// A booking started on /room is restored from its intent instead.
const MOCK_NIGHTLY_RATE = 40.18;
const MOCK_NIGHTS = 2;

function BookContent({ hotelId }: { hotelId: string }) {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") ?? "";
  const listing = getApartmentById(hotelId);
  const booking = useMemo<BookingDetails>(() => {
    const checkIn = addDays(new Date(), 7);
    return {
      listingId: listing.id,
      listingName: listing.name,
      hostAddress: listing.owner.walletAddress?.trim() ?? "",
      checkIn: format(checkIn, "yyyy-MM-dd"),
      checkOut: format(addDays(checkIn, MOCK_NIGHTS), "yyyy-MM-dd"),
      price: computeBookingPrice({
        nightlyRate: MOCK_NIGHTLY_RATE,
        nights: MOCK_NIGHTS,
        guests: 1,
      }),
    };
  }, [listing]);
  const hotelData = {
    hotelName: listing.name,
    description: "King bed stylish Apartment",
    details:
      "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    goodToKnow:
      "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    location: "329 Calle santos, paseo colón, San José",
    coordinates: [9.9281, -84.0907] as [number, number],
    rating: 5.0,
    beds: 2,
    baths: 1,
    imageUrl: "/img/room2.png",
  };

  return (
    <div
      data-hotel-id={hotelId}
      data-booking-id={bookingId}
      className="bg-gray-100 min-h-screen"
    >
      <div className="w-full px-4 md:px-10 py-8 mt-10">
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
          <div className="flex-grow">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <HotelDetails
                hotelName={hotelData.hotelName}
                description={hotelData.description}
                details={hotelData.details}
                goodToKnow={hotelData.goodToKnow}
                location={hotelData.location}
                coordinates={hotelData.coordinates}
                rating={hotelData.rating}
                beds={hotelData.beds}
                baths={hotelData.baths}
                imageUrl={hotelData.imageUrl}
              />
            </div>
          </div>
          <div className="w-full md:w-[400px] shrink-0">
            <EscrowProviders>
              <ReservationSummary bookingId={bookingId} booking={booking} />
            </EscrowProviders>
          </div>
        </div>
      </div>
    </div>
  );
}

const HotelBookPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: hotelId } = use(params);

  return (
    <Suspense fallback={<div className="bg-gray-100 min-h-screen" />}>
      <BookContent hotelId={hotelId} />
    </Suspense>
  );
};

export default HotelBookPage;
