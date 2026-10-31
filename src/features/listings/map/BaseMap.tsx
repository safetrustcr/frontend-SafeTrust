"use client";

import { useState, type ReactNode } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { clientEnv } from "@/config/env";

export interface BaseMapProps {
  center: [number, number];
  zoom?: number;
  children?: ReactNode;
  className?: string;
  scrollWheelZoom?: boolean;
  onTileError?: () => void;
  // Renders a built-in "Map preview unavailable" overlay on tile error,
  // covering the whole map. Defaults on for callers with no fallback of
  // their own; MapPane turns it off since it shows its own, less intrusive
  // banner (the results list stays usable) via onTileError instead.
  showErrorOverlay?: boolean;
}

/**
 * Shared Leaflet canvas: tile URL and attribution come from
 * `NEXT_PUBLIC_MAP_TILE_URL` / `NEXT_PUBLIC_MAP_ATTRIBUTION` (see
 * `next.config.ts`, which derives the CSP `img-src` origin from the same
 * variable). Never render a marker icon from a CDN here; callers supply
 * local CSS markers via `children` (see `PriceMarker`).
 */
export function BaseMap({
  center,
  zoom = 8,
  children,
  className,
  scrollWheelZoom = false,
  onTileError,
  showErrorOverlay = true,
}: BaseMapProps) {
  const [hasTileError, setHasTileError] = useState(false);

  return (
    <div
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted",
        className,
      )}
    >
      {showErrorOverlay && hasTileError && (
        <div
          role="alert"
          className="absolute inset-0 z-[1000] flex flex-col items-center justify-center gap-2 bg-muted/90 p-4 text-center text-sm text-muted-foreground backdrop-blur-sm"
        >
          <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          <p className="font-medium text-foreground">Map preview unavailable</p>
          <p className="text-xs">
            Tiles could not be loaded. Please check your network connection.
          </p>
        </div>
      )}
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={scrollWheelZoom}
        className="h-full w-full"
      >
        <TileLayer
          url={clientEnv.NEXT_PUBLIC_MAP_TILE_URL}
          attribution={clientEnv.NEXT_PUBLIC_MAP_ATTRIBUTION}
          eventHandlers={{
            tileerror: () => {
              setHasTileError(true);
              onTileError?.();
            },
          }}
        />
        {children}
      </MapContainer>
    </div>
  );
}

export default BaseMap;
