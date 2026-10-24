"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, Building2, MapPin } from "lucide-react";
import { DemoBadge } from "@/components/ui/demo-badge";
import { useDemoHotelStore } from "@/features/hotels/manage";

export default function HotelDetailPage() {
  const params = useParams<{ id: string }>();
  const hotel = useDemoHotelStore((s) =>
    s.hotels.find((h) => h.id === params.id),
  );

  // Unknown or removed id → 404.
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
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          {hotel.name} <DemoBadge />
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
                {hotel.locationArea}
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
