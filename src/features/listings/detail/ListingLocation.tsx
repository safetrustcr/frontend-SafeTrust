"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ApartmentListing } from "@/types/hotel";

const ListingMap = dynamic(
  () => import("../map/ListingPinMap").then((m) => m.ListingPinMap),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-muted" />
    ),
  },
);

export function ListingLocation({ listing }: { listing: ApartmentListing }) {
  const [showMap, setShowMap] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const hasCoordinates = Boolean(
    listing.coordinates &&
    typeof listing.coordinates.lat === "number" &&
    typeof listing.coordinates.lng === "number",
  );

  if (!hasCoordinates) {
    return (
      <section aria-labelledby="where-heading" className="space-y-3">
        <h2 id="where-heading" className="text-xl font-semibold">
          Where you&apos;ll stay
        </h2>
        <p className="text-sm text-muted-foreground">{listing.address}</p>
      </section>
    );
  }

  const coordinates: [number, number] = [
    listing.coordinates.lat,
    listing.coordinates.lng,
  ];

  return (
    <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
      <section aria-labelledby="where-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 id="where-heading" className="text-xl font-semibold">
            Where you&apos;ll stay
          </h2>
          {showMap && (
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                aria-label="Expand map"
              >
                <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                Expand
              </Button>
            </DialogTrigger>
          )}
        </div>

        <p className="text-sm text-muted-foreground">{listing.address}</p>
        <p className="text-xs text-muted-foreground">
          Approximate demo location.
        </p>

        {showMap ? (
          <ListingMap center={coordinates} title={listing.name} />
        ) : (
          <Button variant="outline" onClick={() => setShowMap(true)}>
            Show map
          </Button>
        )}

        <DialogContent className="flex h-[85vh] w-[95vw] max-w-4xl flex-col p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Where you&apos;ll stay</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {listing.address} · Approximate demo location.
            </DialogDescription>
          </DialogHeader>
          <div className="relative mt-2 min-h-0 flex-1 overflow-hidden rounded-xl border border-border">
            <ListingMap
              center={coordinates}
              title={listing.name}
              className="h-full w-full aspect-auto rounded-none"
              scrollWheelZoom
            />
          </div>
        </DialogContent>
      </section>
    </Dialog>
  );
}

export default ListingLocation;
