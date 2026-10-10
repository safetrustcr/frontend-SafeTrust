"use client";

import { cn } from "@/lib/utils";
import { APARTMENT_BEDROOM_FILTERS } from "@/lib/mockData/apartmentListings";
import type { BedroomCount } from "./filters/useRentFilters";

interface BedroomTabsProps {
  selected: BedroomCount;
  onSelect: (value: BedroomCount) => void;
}

/** Render the bedroom-count selection tabs. */
export default function BedroomTabs({ selected, onSelect }: BedroomTabsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
      {APARTMENT_BEDROOM_FILTERS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          aria-pressed={selected === tab.value}
          onClick={() => onSelect(tab.value)}
          className={cn(
            "min-h-11 rounded-[10px] border px-3 py-2.5 sm:px-5 sm:py-3 text-sm font-medium transition",
            selected === tab.value
              ? "border dark:border-slate-700 bg-orange-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              : "border dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
