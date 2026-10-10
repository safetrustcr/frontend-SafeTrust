"use client";

import dynamic from "next/dynamic";
import type { ApartmentListing } from "@/types/hotel";
import Details from "@/components/hotels/details/Details";
import Gallery from "@/components/hotels/details/Gallery";
import Information from "@/components/hotels/details/Information";
import Header from "@/components/layouts/Header";
import { SideBar } from "@/components/layouts/SideBar";

const HotelMap = dynamic(() => import("@/components/hotels/payment/Map"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full min-h-[250px] items-center justify-center rounded-lg bg-gray-200 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300"
      role="status"
    >
      Loading map...
    </div>
  ),
});

export default function HotelDetailClient({
  hotel,
}: {
  hotel: ApartmentListing;
}) {
  const coordinates: [number, number] = [
    hotel.coordinates.lat,
    hotel.coordinates.lng,
  ];

  return (
    <div
      data-hotel-id={hotel.id}
      className="bg-gray-100 min-h-screen dark:bg-dark-background text-black dark:text-white text-sm"
    >
      <Header />
      <div className="flex flex-col lg:flex-row mt-8">
        <SideBar className="hidden md:block" notificationCount={2} />
        <div className="flex-grow p-4 flex flex-col items-center gap-6">
          <div className="w-full md:w-2/3">
            <Gallery images={hotel.images} />
          </div>
          <div className="w-full md:w-2/3 flex flex-wrap">
            <div className="w-full md:w-3/4 lg:w-3/4">
              <Information
                name={hotel.name}
                location={`${hotel.address}, Costa Rica`}
                price={`$${hotel.price.toFixed(2)}`}
              />
            </div>
            <div className="hidden md:block md:w-1/4 lg:w-1/4" />
          </div>
          <div className="w-full md:w-2/3 flex flex-wrap gap-4">
            <div className="w-full md:w-3/4 lg:w-3/4 flex gap-4">
              <div className="w-full md:w-1/2 min-h-[250px]">
                <Details
                  beds={hotel.bedrooms}
                  baths={hotel.bathrooms}
                  description={hotel.description}
                />
              </div>
              <div className="w-full md:w-1/2 min-h-[250px]">
                <HotelMap coordinates={coordinates} hotelName={hotel.name} />
              </div>
            </div>
            <div className="hidden md:block md:w-1/4 lg:w-1/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
