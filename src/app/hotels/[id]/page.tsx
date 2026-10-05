"use client";

import { use, useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/layouts/Header";
import { SideBar } from "@/components/layouts/SideBar";
import Gallery from "@/components/hotels/details/Gallery";
import Information from "@/components/hotels/details/Information";
import Details from "@/components/hotels/details/Details";
import { getApartmentById } from "@/lib/mockData/apartmentListings";

/**
 * Leaflet / react-leaflet is only loaded when the map section enters the
 * viewport (IntersectionObserver).  This keeps it out of the initial bundle
 * for /hotels/[id] and avoids the SSR window-is-not-defined error.
 */
const HotelMap = dynamic(() => import("@/components/hotels/payment/Map"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full min-h-[250px] w-full items-center justify-center rounded-lg bg-gray-200 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300 animate-pulse"
      role="status"
    >
      Loading map...
    </div>
  ),
});

export default function HotelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const hotelName = getApartmentById(id).name;
  const images = [
    "/img/room1.png",
    "/img/room2.png",
    "/img/room2.png",
    "/img/room2.png",
  ];

  const coordinates: [number, number] = [9.9333, -84.0833];

  // Only render the map once the section scrolls into view.
  const mapSectionRef = useRef<HTMLDivElement>(null);
  const [mapVisible, setMapVisible] = useState(false);

  useEffect(() => {
    const el = mapSectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMapVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      data-hotel-id={id}
      className="bg-gray-100 min-h-screen dark:bg-dark-background text-black dark:text-white text-sm"
    >
      <Header />
      <div className="flex flex-col lg:flex-row mt-8">
        <SideBar className="hidden md:block" notificationCount={2} />
        <div className="flex-grow p-4 flex flex-col items-center gap-6">
          <div className="w-full md:w-2/3">
            <Gallery images={images} />
          </div>

          <div className="w-full md:w-2/3 flex flex-wrap">
            <div className="w-full md:w-3/4 lg:w-3/4">
              <Information
                name={hotelName}
                location="329 Calle Santos, Paseo Colón, San José, Costa Rica"
                price="$40.18"
              />
            </div>
            <div className="hidden md:block md:w-1/4 lg:w-1/4" />
          </div>

          <div className="w-full md:w-2/3 flex flex-wrap gap-4">
            <div className="w-full md:w-3/4 lg:w-3/4 flex gap-4">
              <div className="w-full md:w-1/2 min-h-[250px]">
                <Details
                  beds={2}
                  baths={1}
                  description="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
                />
              </div>
              {/* Map section — deferred until visible */}
              <div
                ref={mapSectionRef}
                className="w-full md:w-1/2 min-h-[250px]"
              >
                {mapVisible && (
                  <HotelMap coordinates={coordinates} hotelName={hotelName} />
                )}
              </div>
            </div>
            <div className="hidden md:block md:w-1/4 lg:w-1/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
