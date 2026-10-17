"use client";

import { useMemo } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import { BaseMap, type BaseMapProps } from "./BaseMap";

export interface ListingPinMapProps extends Omit<BaseMapProps, "children"> {
  title?: string;
}

export function ListingPinMap({
  center,
  zoom = 14,
  className,
  title,
  scrollWheelZoom = false,
}: ListingPinMapProps) {
  const pinIcon = useMemo(() => {
    return L.divIcon({
      className: "safetrust-listing-pin",
      html: `
        <div style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:#c2410c;color:#ffffff;box-shadow:0 4px 14px rgba(0,0,0,0.35);border:2px solid #ffffff;transform:translate3d(0,0,0);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
          </svg>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
    });
  }, []);

  return (
    <BaseMap
      center={center}
      zoom={zoom}
      className={className}
      scrollWheelZoom={scrollWheelZoom}
    >
      <Marker position={center} icon={pinIcon} title={title} />
    </BaseMap>
  );
}

export default ListingPinMap;
