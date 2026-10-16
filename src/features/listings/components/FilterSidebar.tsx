"use client";

import { formatListingPrice } from "./formatListingPrice";
import { PRICE_BOUNDS, type RentFilters } from "../../model";

interface FilterSidebarProps {
  filters: RentFilters;
  setFilters: (patch: Partial<RentFilters>) => void;
  reset: () => void;
  className?: string;
}

/** Price controls shared by the sidebar and mobile filter sheet. */
export default function FilterSidebar({
  filters,
  setFilters,
  reset,
  className,
}: FilterSidebarProps) {
  const { minPrice, maxPrice } = filters;

  return (
    <aside
      className={
        className ??
        "w-full border-b border-border px-6 py-8 lg:border-b-0 lg:border-r"
      }
    >
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
