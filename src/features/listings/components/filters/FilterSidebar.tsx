"use client";

import { useMemo, useState } from "react";
import {
  filterFacets,
  LISTING_CATEGORIES,
  LISTING_LOCATIONS,
  type RentFilters,
  type RentFiltersPatch,
} from "../../model/filters";
import type { Listing } from "../../model/types";
import { FilterChecklist } from "./FilterChecklist";
import { PriceRangeSlider } from "./PriceRangeSlider";

interface FilterSidebarProps {
  filters: RentFilters;
  setFilters: (patch: RentFiltersPatch) => void;
  reset: () => void;
  /** The listings being filtered, for the option counts and price spread. */
  listings: Listing[];
  /** Listings for the location counts, when they differ from `listings`. */
  locationListings?: Listing[];
  className?: string;
}

const toggle = <T,>(items: readonly T[], item: T): T[] =>
  items.includes(item)
    ? items.filter((value) => value !== item)
    : [...items, item];

/** Filter controls shared by the sidebar and mobile filter sheet. */
export default function FilterSidebar({
  filters,
  setFilters,
  reset,
  listings,
  locationListings,
  className,
}: FilterSidebarProps) {
  const { minPrice, maxPrice } = filters;
  // Remounting the slider on Clear all drops a price change still waiting to commit.
  const [resetCount, setResetCount] = useState(0);
  const facets = useMemo(
    () => filterFacets(listings, filters, locationListings),
    [listings, filters, locationListings],
  );

  return (
    <aside
      className={
        className ??
        "w-full border-b border-border px-5 py-8 lg:w-56 lg:border-b-0 lg:border-r"
      }
    >
      <div className="space-y-6 divide-y divide-border [&>*:not(:first-child)]:pt-6">
        <div>
          <FilterChecklist
            legend="Category"
            options={LISTING_CATEGORIES}
            selected={filters.categories}
            counts={facets.categories}
            onToggle={(category) =>
              setFilters((current) => ({
                categories: toggle(current.categories, category),
              }))
            }
          />
        </div>

        <section aria-label="Price range">
          <h2 className="text-sm font-semibold text-foreground">Price range</h2>
          <PriceRangeSlider
            key={resetCount}
            min={minPrice}
            max={maxPrice}
            histogram={facets.priceHistogram}
            onChange={setFilters}
          />
        </section>

        {/* A legend sits on its fieldset's border, so the divider goes outside. */}
        <div>
          <FilterChecklist
            legend="Location"
            options={LISTING_LOCATIONS}
            selected={filters.locations}
            counts={facets.locations}
            onToggle={(location) =>
              setFilters((current) => ({
                locations: toggle(current.locations, location),
              }))
            }
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setResetCount((count) => count + 1);
          reset();
        }}
        className="mt-6 w-full text-left text-sm font-medium text-primary hover:text-primary/80"
      >
        Clear all filters
      </button>
    </aside>
  );
}
