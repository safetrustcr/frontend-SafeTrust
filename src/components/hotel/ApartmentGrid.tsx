'use client';

import type { HotelListing } from '@/@types/hotel';
import ApartmentCard from './ApartmentCard';

interface ApartmentGridProps {
  apartments: HotelListing[];
  onApartmentClick: (apartment: HotelListing) => void;
}

export default function ApartmentGrid({
  apartments,
  onApartmentClick,
}: ApartmentGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {apartments.map((apartment) => (
        <ApartmentCard
          key={apartment.id}
          apartment={apartment}
          onClick={() => onApartmentClick(apartment)}
        />
      ))}
    </div>
  );
}
