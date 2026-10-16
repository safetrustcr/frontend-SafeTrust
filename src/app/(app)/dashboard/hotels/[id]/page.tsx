"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2, MapPin } from "lucide-react";

// TODO: replace with Hasura query → public.hotels filtered by the current
// user's id (BE-03). When the query returns null (id unknown or foreign),
// notFound() below surfaces a 404 without revealing whether the id exists.
const STUB_HOTELS = [
  {
    id: "1",
    name: "Metropolitan Tower",
    address: "Avenida Central 100, San José",
    location_area: "San José Centro",
    description: "Luxury hotel in downtown San José",
  },
  {
    id: "2",
    name: "Mountain Peak Lodge",
    address: "Calle 5, Escazú, San José",
    location_area: "Escazú",
    description: "Boutique lodge with mountain views",
  },
  {
    id: "3",
    name: "Oceanview Resort & Spa",
    address: "Playa Jacó, Puntarenas",
    location_area: "Jacó",
    description: "Beachfront resort with full spa",
  },
];

export default function HotelDetailPage() {
  const params = useParams();
  const hotel = STUB_HOTELS.find((h) => h.id === params.id);

  // Unknown or foreign id → 404 (does not reveal whether the id exists).
  if (!hotel) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Link
        href="/dashboard/hotels"
        className="flex items-center gap-2 text-sm
                   text-gray-400 hover:text-white transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Hotels
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {hotel.name}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Hotel details and information
        </p>
      </div>

      <div
        className="rounded-xl border border-gray-200 dark:border-slate-700
                      bg-white dark:bg-slate-900 overflow-hidden"
      >
        <div className="p-6 space-y-6">
          {/* Name */}
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-orange-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Name
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                {hotel.name}
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-orange-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Address
              </p>
              <p className="text-sm text-gray-900 dark:text-white mt-0.5">
                {hotel.address}
              </p>
            </div>
          </div>

          {/* Location Area */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-orange-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Area
              </p>
              <p className="text-sm text-gray-900 dark:text-white mt-0.5">
                {hotel.location_area}
              </p>
            </div>
          </div>

          {/* Description */}
          {hotel.description && (
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-orange-400">i</span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Description
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                  {hotel.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
