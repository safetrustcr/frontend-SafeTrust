"use client";

import {
  APARTMENT_CATEGORIES,
  APARTMENT_LOCATIONS,
} from "@/lib/mockData/apartmentListings";
import { formatListingPrice } from "./formatListingPrice";
import {
  PRICE_BOUNDS,
  type Category,
  type RentFilters,
} from "./filters/useRentFilters";

interface FilterSidebarProps {
  filters: RentFilters;
  setFilters: (patch: Partial<RentFilters>) => void;
  reset: () => void;
  className?: string;
}

function CheckboxRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 dark:border-slate-600"
      />
      {label}
    </label>
  );
}

/** Render the shared category, price, and location filters. */
export default function FilterSidebar({
  filters,
  setFilters,
  reset,
  className,
}: FilterSidebarProps) {
  const { categories, location, minPrice, maxPrice } = filters;

  const toggleCategory = (category: Category) => {
    const nextCategories =
      categories.length === 0
        ? [category]
        : categories.includes(category)
          ? categories.filter((item) => item !== category)
          : [...categories, category];
    setFilters({ categories: nextCategories });
  };

  return (
    <aside
      className={
        className ??
        "w-full border-b border-border px-6 py-8 lg:border-b-0 lg:border-r"
      }
    >
      <section className="pb-8">
        <h2 className="mb-5 text-sm font-semibold text-foreground">Category</h2>
        <div className="space-y-3">
          <CheckboxRow
            checked={categories.length === 0}
            label="All categories"
            onChange={() => setFilters({ categories: [] })}
          />
          {APARTMENT_CATEGORIES.map((category) => (
            <CheckboxRow
              key={category}
              checked={categories.includes(category)}
              label={category}
              onChange={() => toggleCategory(category)}
            />
          ))}
        </div>
      </section>

      <div className="my-0 h-px bg-border" />

      <section className="py-8">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Price Range
        </h2>
        <p className="mb-5 text-sm text-gray-700 dark:text-gray-300">
          {formatListingPrice(minPrice)} - {formatListingPrice(maxPrice)}
        </p>

        <div className="space-y-3">
          <label
            className="block text-xs text-muted-foreground"
            htmlFor="minimum-price-range"
          >
            Minimum price
          </label>
          <input
            type="range"
            aria-label="Minimum price"
            min={PRICE_BOUNDS.min}
            max={PRICE_BOUNDS.max}
            step={100}
            value={minPrice}
            onChange={(event) =>
              setFilters({
                minPrice: Math.min(Number(event.target.value), maxPrice),
              })
            }
            className="min-h-10 w-full touch-pan-y accent-orange-500"
          />
          <label
            className="block text-xs text-muted-foreground"
            htmlFor="maximum-price-range"
          >
            Maximum price
          </label>
          <input
            type="range"
            aria-label="Maximum price"
            min={PRICE_BOUNDS.min}
            max={PRICE_BOUNDS.max}
            step={100}
            value={maxPrice}
            onChange={(event) =>
              setFilters({
                maxPrice: Math.max(Number(event.target.value), minPrice),
              })
            }
            className="min-h-10 w-full touch-pan-y accent-orange-500"
          />
        </div>
      </section>

      <div className="my-0 h-px bg-border" />

      <section className="pt-8">
        <h2 className="mb-5 text-sm font-semibold text-foreground">Location</h2>
        <div className="space-y-3">
          <CheckboxRow
            checked={location === null}
            label="All Costa Rica"
            onChange={() => setFilters({ location: null })}
          />
          {APARTMENT_LOCATIONS.map((location) => (
            <CheckboxRow
              key={location}
              checked={filters.location === location}
              label={location}
              onChange={() =>
                setFilters({
                  location: filters.location === location ? null : location,
                })
              }
            />
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={reset}
        className="mt-8 w-full text-left text-sm font-medium text-orange-700 hover:text-orange-800 dark:text-orange-400"
      >
        Clear all filters
      </button>
    </aside>
  );
}
