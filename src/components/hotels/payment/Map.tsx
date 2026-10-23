"use client";

import { BaseMap } from "@/features/listings/map/BaseMap";
import { PriceMarker } from "@/features/listings/map/PriceMarker";

interface MapProps {
  coordinates: [number, number];
  hotelName: string;
  // Optional: callers that only need to mark a location (e.g. the room
  // listing's map dialog) don't have a price to show; PriceMarker falls
  // back to hotelName as the pin's label in that case.
  price?: number;
}

const HotelMap: React.FC<MapProps> = ({ coordinates, hotelName, price }) => {
  return (
    <BaseMap
      center={coordinates}
      zoom={13}
      className="h-full w-full aspect-auto"
    >
      <PriceMarker id={hotelName} position={coordinates} price={price} />
    </BaseMap>
  );
};

export default HotelMap;
