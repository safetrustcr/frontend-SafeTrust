"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Hotel } from "@/@types/hotel.entity";
import { hotelsMockData } from "@/components/hotels/mocks/hotel.mock";
import HotelCard from "./HotelCard";

export default function HotelGrid() {
  const [hotels, setHotels] = useState<Hotel[]>(hotelsMockData);

  const toggleFavorite = (id: number) => {
    setHotels(
      hotels.map((hotel) =>
        hotel.id === id ? { ...hotel, isFavorite: !hotel.isFavorite } : hotel,
      ),
    );
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button variant="link" className="text-blue-500">
          View all
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <HotelCard
            key={hotel.id}
            hotel={hotel}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    </>
  );
}
