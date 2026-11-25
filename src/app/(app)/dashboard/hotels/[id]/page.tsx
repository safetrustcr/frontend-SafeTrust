"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, Building2, MapPin } from "lucide-react";
import { DemoBadge } from "@/components/ui/demo-badge";
import { useDemoHotelStore } from "@/features/listings";

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
                   text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Hotels
      </Link>

      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          {hotel.name} <DemoBadge />
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Hotel details and information
        </p>
      </div>

      <div
        className="rounded-xl border border-border
                      bg-card overflow-hidden"
      >
        <div className="p-6 space-y-6">
          {/* Name */}
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-orange-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Name
              </p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {hotel.name}
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-orange-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Address
              </p>
              <p className="text-sm text-foreground mt-0.5">{hotel.address}</p>
            </div>
          </div>

          {/* Location Area */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-orange-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Area
              </p>
              <p className="text-sm text-foreground mt-0.5">
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
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Description
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
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
