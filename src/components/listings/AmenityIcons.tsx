"use client";

import type { HotelAmenitySummary } from "@/@types/hotel";
import { FaBath, FaBed, FaPaw } from "react-icons/fa";

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
        className={`grid rounded-full bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400 ${
          compact ? 'h-6 w-6 place-items-center' : 'h-8 w-8 place-items-center'
        }`}
      >
        {icon}
      </span>
      <span className={`${compact ? 'text-[11px]' : 'text-sm'} text-gray-500 dark:text-gray-300`}>
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
      className={`flex flex-nowrap items-center overflow-hidden ${compact ? "gap-3" : "gap-5"}`}
    >
      <AmenityPill
        compact={compact}
        icon={<FaBed className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />}
        label={`${bedrooms} bd.`}
      />
      <AmenityPill
        compact={compact}
        icon={<FaPaw className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />}
        label={petFriendly ? "pet friendly" : "no pets"}
      />
      <AmenityPill
        compact={compact}
        icon={<FaBath className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />}
        label={`${bathrooms} ba.`}
      />
    </div>
  );
}
