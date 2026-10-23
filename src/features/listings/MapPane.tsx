"use client";

import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import type { ApartmentListing } from "@/types/hotel";
import { BaseMap } from "./map/BaseMap";
import { PriceMarker } from "./map/PriceMarker";

// San José, Costa Rica. Only used as the initial center before FitBounds
// runs; never rendered without at least one listing (see ListingResultsMap).
const FALLBACK_CENTER: [number, number] = [9.9281, -84.0907];

function FitBounds({ listings }: { listings: ApartmentListing[] }) {
  const map = useMap();

  useEffect(() => {
    if (listings.length === 0) return;
    // animate: false avoids a Leaflet crash ("Cannot read properties of
    // undefined (reading '_leaflet_pos')") when the map unmounts (reload,
    // Back navigation) while a pan/zoom animation frame is still pending.
    if (listings.length === 1) {
      const { lat, lng } = listings[0].coordinates;
      map.setView([lat, lng], 13, { animate: false });
      return;
    }
    const bounds = listings.map((listing): [number, number] => [
      listing.coordinates.lat,
      listing.coordinates.lng,
    ]);
    map.fitBounds(bounds, { padding: [32, 32], animate: false });
  }, [listings, map]);

  return null;
}

interface MapPaneProps {
  listings: ApartmentListing[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** The Leaflet canvas for the results map: pins, fit-to-bounds, and the tile-error fallback. */
export default function MapPane({
  listings,
  selectedId,
  onSelect,
}: MapPaneProps) {
  const [tileError, setTileError] = useState(false);
  const center: [number, number] = listings.length
    ? [listings[0].coordinates.lat, listings[0].coordinates.lng]
    : FALLBACK_CENTER;

  return (
    <div className="relative h-full w-full">
      <BaseMap
        center={center}
        className="h-full w-full aspect-auto rounded-none"
        showErrorOverlay={false}
        onTileError={() => setTileError(true)}
      >
        <FitBounds listings={listings} />
        {listings.map((listing) => (
          <PriceMarker
            key={listing.id}
            id={listing.id}
            position={[listing.coordinates.lat, listing.coordinates.lng]}
            price={listing.price}
            selected={listing.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </BaseMap>
      {tileError ? (
        <div
          role="status"
          className="pointer-events-none absolute inset-x-3 top-3 z-10 rounded-lg border border-border bg-background/95 px-3 py-2 text-center text-sm text-foreground shadow-md"
        >
          Map tiles couldn&apos;t load. The list still works.
        </div>
      ) : null}
    </div>
  );
}
