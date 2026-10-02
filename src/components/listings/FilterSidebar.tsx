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
}

const PRICE_BARS = [
  { id: "bar-1", height: 10 },
  { id: "bar-2", height: 18 },
  { id: "bar-3", height: 24 },
  { id: "bar-4", height: 20 },
  { id: "bar-5", height: 28 },
  { id: "bar-6", height: 16 },
  { id: "bar-7", height: 22 },
  { id: "bar-8", height: 14 },
  { id: "bar-9", height: 10 },
  { id: "bar-10", height: 26 },
];

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

export default function FilterSidebar({
  filters,
  setFilters,
  reset,
}: FilterSidebarProps) {
  const { categories, location, minPrice, maxPrice } = filters;
  const leftPercent =
    ((minPrice - PRICE_BOUNDS.min) / (PRICE_BOUNDS.max - PRICE_BOUNDS.min)) *
    100;
  const rightPercent =
    ((maxPrice - PRICE_BOUNDS.min) / (PRICE_BOUNDS.max - PRICE_BOUNDS.min)) *
    100;

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
    <aside className="w-full border-b border-gray-200 px-6 py-8 lg:w-[215px] lg:border-b-0 lg:border-r dark:border-slate-700 dark:bg-slate-900/0">
      <section className="pb-8">
        <h2 className="mb-5 text-[15px] font-semibold text-gray-900 dark:text-white">
          Category
        </h2>
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

      <div className="my-0 h-px bg-gray-200 dark:bg-slate-700" />

      <section className="py-8">
        <h2 className="mb-3 text-[15px] font-semibold text-gray-900 dark:text-white">
          Price Range
        </h2>
        <p className="mb-5 text-sm text-gray-700 dark:text-gray-300">
          {formatListingPrice(minPrice)} - {formatListingPrice(maxPrice)}
        </p>

        <div className="relative px-2 pb-3">
          <div className="mb-4 flex h-10 items-end justify-between gap-1">
            {PRICE_BARS.map((bar) => (
              <span
                key={bar.id}
                className="w-full rounded-t-sm bg-orange-200 dark:bg-orange-900/30"
                style={{ height: `${bar.height}px` }}
              />
            ))}
          </div>
          <div className="relative h-1 rounded-full bg-orange-100 dark:bg-orange-900/20">
            <div
              className="absolute h-1 rounded-full bg-orange-500"
              style={{
                left: `${leftPercent}%`,
                width: `${Math.max(rightPercent - leftPercent, 4)}%`,
              }}
            />
            <span
              className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-orange-500 shadow"
              style={{ left: `calc(${leftPercent}% - 8px)` }}
            />
            <span
              className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-orange-500 shadow"
              style={{ left: `calc(${rightPercent}% - 8px)` }}
            />
          </div>
          <input
            type="range"
            min={PRICE_BOUNDS.min}
            max={PRICE_BOUNDS.max}
            step={100}
            value={minPrice}
            onChange={(event) =>
              setFilters({
                minPrice: Math.min(Number(event.target.value), maxPrice),
              })
            }
            className="absolute inset-x-0 top-0 h-full w-full appearance-none bg-transparent opacity-0 cursor-pointer"
          />
          <input
            type="range"
            min={PRICE_BOUNDS.min}
            max={PRICE_BOUNDS.max}
            step={100}
            value={maxPrice}
            onChange={(event) =>
              setFilters({
                maxPrice: Math.max(Number(event.target.value), minPrice),
              })
            }
            className="absolute inset-x-0 top-0 h-full w-full appearance-none bg-transparent opacity-0 cursor-pointer"
          />
        </div>
      </section>

      <div className="my-0 h-px bg-gray-200 dark:bg-slate-700" />

      <section className="pt-8">
        <h2 className="mb-5 text-[15px] font-semibold text-gray-900 dark:text-white">
          Location
        </h2>
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
        className="mt-8 w-full text-left text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
      >
        Clear all filters
      </button>
    </aside>
  );
}
