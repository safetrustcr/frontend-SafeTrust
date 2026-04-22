'use client';

import type { HotelAmenitySummary } from '@/@types/hotel';
import { FaBath, FaBed, FaPaw } from 'react-icons/fa';

interface AmenityIconsProps extends HotelAmenitySummary {
  compact?: boolean;
}

function AmenityPill({
  icon,
  label,
  compact = false,
}: {
  icon: React.ReactNode;
  label: string;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`grid rounded-full bg-[#fff1e7] text-[#ff6a00] ${
          compact ? 'h-6 w-6 place-items-center' : 'h-8 w-8 place-items-center'
        }`}
      >
        {icon}
      </span>
      <span className={`${compact ? 'text-[11px]' : 'text-sm'} text-[#6b7280]`}>
        {label}
      </span>
    </div>
  );
}

export default function AmenityIcons({
  bedrooms,
  bathrooms,
  petFriendly,
  compact = false,
}: AmenityIconsProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-4 ${compact ? 'gap-3' : 'gap-5'}`}
    >
      <AmenityPill
        compact={compact}
        icon={<FaBed className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
        label={`${bedrooms} bd.`}
      />
      <AmenityPill
        compact={compact}
        icon={<FaPaw className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
        label={petFriendly ? 'pet friendly' : 'no pets'}
      />
      <AmenityPill
        compact={compact}
        icon={<FaBath className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
        label={`${bathrooms} ba.`}
      />
    </div>
  );
}
