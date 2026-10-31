"use client";

import { addDays, format, parseISO } from "date-fns";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { ApartmentListing } from "@/types/hotel";
import HotelDetails from "@/components/hotels/payment/HotelDetails";
import ReservationSummary from "@/components/hotels/payment/ReservationSummary";
import type { BookingDetails } from "@/features/escrow/booking-escrow.machine";
import { computeBookingPrice } from "@/features/escrow/pricing";
import { parseHotelSearch } from "@/features/hotels";
import { nightsBetween } from "@/features/listings/search/date-only";
import { PageContainer } from "@/components/layouts/PageContainer";

const MOCK_NIGHTS = 2;

function BookContent({ hotel }: { hotel: ApartmentListing }) {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") ?? "";
  const { from, to } = parseHotelSearch(
    new URLSearchParams(searchParams.toString()),
  );
  const booking = useMemo<BookingDetails>(() => {
    const checkInDate = from ? parseISO(from) : addDays(new Date(), 7);
    const checkOutDate = to ? parseISO(to) : addDays(checkInDate, MOCK_NIGHTS);
    const nights = from && to ? nightsBetween(from, to) : MOCK_NIGHTS;
    return {
      listingId: hotel.id,
      listingName: hotel.name,
      hostAddress: hotel.owner.walletAddress?.trim() ?? "",
      checkIn: format(checkInDate, "yyyy-MM-dd"),
      checkOut: format(checkOutDate, "yyyy-MM-dd"),
      price: computeBookingPrice({
        nightlyRate: hotel.price,
        nights,
        guests: 1,
      }),
    };
  }, [hotel, from, to]);
  const hotelData = {
    hotelName: hotel.name,
    description: hotel.description,
    details: hotel.description,
    goodToKnow: `Located in ${hotel.location}, Costa Rica. Contact your host to confirm check-in arrangements.`,
    location: `${hotel.address}, Costa Rica`,
    coordinates: [hotel.coordinates.lat, hotel.coordinates.lng] as [
      number,
      number,
    ],
    rating: hotel.rating,
    beds: hotel.bedrooms,
    baths: hotel.bathrooms,
    imageUrl: hotel.images[0],
  };

  return (
    <div
      data-hotel-id={hotel.id}
      data-booking-id={bookingId}
      className="bg-gray-100 min-h-screen"
    >
      <PageContainer className="py-8 pt-10">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="min-w-0 flex-grow lg:order-first">
            <div className="bg-card rounded-lg p-6 shadow-sm">
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
          <div className="order-first w-full shrink-0 lg:order-last lg:w-96">
            <ReservationSummary bookingId={bookingId} booking={booking} />
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

export default function HotelBookClient({
  hotel,
}: {
  hotel: ApartmentListing;
}) {
  return (
    <Suspense fallback={<div className="bg-gray-100 min-h-screen" />}>
      <BookContent hotel={hotel} />
    </Suspense>
  );
}
