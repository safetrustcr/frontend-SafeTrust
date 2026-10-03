"use client";

import FilterSidebar from "./FilterSidebar";

interface RentFiltersPanelProps {
  selectedCategories: string[];
  selectedLocations: string[];
  selectedBedrooms: string;
  minPrice: number;
  maxPrice: number;
  onCategoryToggle: (category: string) => void;
  onLocationToggle: (location: string) => void;
  onBedroomChange: (bedroom: string) => void;
  onMinPriceChange: (value: number) => void;
  onMaxPriceChange: (value: number) => void;
}

const BEDROOM_OPTIONS = [
  { label: "Any", value: "all" },
  { label: "1 bedroom", value: "1" },
  { label: "2 bedrooms", value: "2" },
  { label: "3+ bedrooms", value: "3" },
];

/** Combine bedrooms with the shared category, location, and price controls. */
export default function RentFiltersPanel({
  selectedCategories,
  selectedLocations,
  selectedBedrooms,
  minPrice,
  maxPrice,
  onCategoryToggle,
  onLocationToggle,
  onBedroomChange,
  onMinPriceChange,
  onMaxPriceChange,
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
              aria-pressed={selectedBedrooms === value}
              onClick={() => onBedroomChange(value)}
              className={`min-h-10 rounded-md border px-3 text-sm transition-colors ${
                selectedBedrooms === value
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
        selectedCategories={selectedCategories}
        selectedLocations={selectedLocations}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onCategoryToggle={onCategoryToggle}
        onLocationToggle={onLocationToggle}
        onMinPriceChange={onMinPriceChange}
        onMaxPriceChange={onMaxPriceChange}
        className="w-full p-0"
      />
    </div>
  );
}
