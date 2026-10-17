"use client";

import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BaseMapProps {
  center: [number, number];
  zoom?: number;
  className?: string;
  children?: React.ReactNode;
  scrollWheelZoom?: boolean;
}

export function BaseMap({
  center,
  zoom = 13,
  className,
  children,
  scrollWheelZoom = false,
}: BaseMapProps) {
  const [hasTileError, setHasTileError] = useState(false);

  return (
    <div
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted",
        className,
      )}
    >
      {hasTileError && (
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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{
            tileerror: () => {
              setHasTileError(true);
            },
          }}
        />
        {children}
      </MapContainer>
    </div>
  );
}

export default BaseMap;
