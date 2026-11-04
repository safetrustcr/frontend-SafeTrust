"use client";

import { useState } from "react";
import type { Listing } from "../../model/types";
import HotelCard from "../cards/HotelCard";

interface HotelGridProps {
  hotels: Listing[];
  from?: string | null;
  to?: string | null;
}

export default function HotelGrid({ hotels, from, to }: HotelGridProps) {
  const [saved, setSaved] = useState<Set<string>>(() => new Set());

  const toggleSaved = (id: string) => {
    setSaved((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {hotels.map((hotel) => (
        <HotelCard
          key={hotel.id}
          hotel={hotel}
          from={from}
          to={to}
          saved={saved.has(hotel.id)}
          onToggleSaved={toggleSaved}
        />
      ))}
    </div>
  );
}
