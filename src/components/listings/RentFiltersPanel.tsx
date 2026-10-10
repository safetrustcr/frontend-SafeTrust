"use client";

import FilterSidebar from "./FilterSidebar";
import type { RentFilters } from "./filters/useRentFilters";

interface RentFiltersPanelProps {
  filters: RentFilters;
  setFilters: (patch: Partial<RentFilters>) => void;
  reset: () => void;
}

const BEDROOM_OPTIONS = [
  { label: "Any", value: "all" },
  { label: "1 bedroom", value: "1" },
  { label: "2 bedrooms", value: "2" },
  { label: "3+ bedrooms", value: "3" },
] as const;

/** Combine bedrooms with the shared category, location, and price controls. */
export default function RentFiltersPanel({
  filters,
  setFilters,
  reset,
}: RentFiltersPanelProps) {
  return (
    <div>
      <section className="border-b border-border py-6">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Bedrooms</h3>
        <div className="grid grid-cols-2 gap-2">
          {BEDROOM_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              aria-pressed={filters.bedrooms === value}
              onClick={() => setFilters({ bedrooms: value })}
              className={`min-h-10 rounded-md border px-3 text-sm transition-colors ${
                filters.bedrooms === value
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-border text-foreground hover:bg-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>
      <FilterSidebar
        filters={filters}
        setFilters={setFilters}
        reset={reset}
        className="w-full p-0"
      />
    </div>
  );
}
