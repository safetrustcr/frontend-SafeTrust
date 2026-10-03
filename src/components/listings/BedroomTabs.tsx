"use client";

import { cn } from '@/lib/utils';
import { APARTMENT_BEDROOM_FILTERS } from '@/lib/mockData/apartmentListings';

interface BedroomTabsProps {
  selected: string;
  onSelect: (value: string) => void;
}

/** Render the bedroom-count selection tabs. */
export default function BedroomTabs({ selected, onSelect }: BedroomTabsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {APARTMENT_BEDROOM_FILTERS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onSelect(tab.value)}
          className={cn(
            "rounded-lg border px-6 py-3 text-sm font-medium transition",
            selected === tab.value
              ? "border dark:border-slate-700 bg-orange-50 dark:bg-slate-800 text-gray-900 dark:text-white"
              : "border dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-600",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
