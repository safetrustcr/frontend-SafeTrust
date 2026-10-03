"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { ApartmentListing } from "@/types/hotel";
import HotelDetails from "@/components/hotels/payment/HotelDetails";
import ReservationSummary from "@/components/hotels/payment/ReservationSummary";

function BookContent({ hotel }: { hotel: ApartmentListing }) {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") ?? "";
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
    price: hotel.price,
    tax: 10.5,
    checkIn: new Date("2025-07-14"),
    checkOut: new Date("2025-08-02"),
    imageUrl: hotel.images[0],
  };

  return (
    <div
      data-hotel-id={hotel.id}
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
            <ReservationSummary
              hotelName={hotelData.hotelName}
              description={hotelData.description}
              price={hotelData.price}
              tax={hotelData.tax}
              checkIn={hotelData.checkIn}
              checkOut={hotelData.checkOut}
            />
          </div>
        </div>
      </div>
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
