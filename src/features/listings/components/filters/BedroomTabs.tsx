"use client";

import { cn } from "@/lib/utils";
import { BEDROOM_FILTERS, type BedroomCount } from "../../model/filters";

interface BedroomTabsProps {
  selected: BedroomCount;
  onSelect: (value: BedroomCount) => void;
}

/** Render the bedroom-count selection tabs. */
export default function BedroomTabs({ selected, onSelect }: BedroomTabsProps) {
  return (
    <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:flex sm:flex-wrap">
      {BEDROOM_FILTERS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          aria-pressed={selected === tab.value}
          onClick={() => onSelect(tab.value)}
          className={cn(
            "min-h-11 rounded-[10px] border px-3 py-2 sm:min-h-9 sm:px-4 text-sm font-medium transition",
            selected === tab.value
              ? "border dark:border-slate-700 bg-accent text-accent-foreground"
              : "border dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
