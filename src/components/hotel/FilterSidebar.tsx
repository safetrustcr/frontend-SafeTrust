'use client';

import { HOTEL_CATEGORIES, HOTEL_LOCATIONS } from '@/mockData/hotels';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  selectedCategories: string[];
  selectedLocations: string[];
  minPrice: number;
  maxPrice: number;
  onCategoryToggle: (category: string) => void;
  onLocationToggle: (location: string) => void;
  onMinPriceChange: (value: number) => void;
  onMaxPriceChange: (value: number) => void;
}

const PRICE_BARS = [
  { id: 'bar-1', height: 10 },
  { id: 'bar-2', height: 18 },
  { id: 'bar-3', height: 24 },
  { id: 'bar-4', height: 20 },
  { id: 'bar-5', height: 28 },
  { id: 'bar-6', height: 16 },
  { id: 'bar-7', height: 22 },
  { id: 'bar-8', height: 14 },
  { id: 'bar-9', height: 10 },
  { id: 'bar-10', height: 26 },
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
    <label className="flex items-center gap-3 text-sm text-[#2f2f2f]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-[#d8d8d8] text-[#ff6a00] focus:ring-[#ff6a00]"
      />
      {label}
    </label>
  );
}

export default function FilterSidebar({
  selectedCategories,
  selectedLocations,
  minPrice,
  maxPrice,
  onCategoryToggle,
  onLocationToggle,
  onMinPriceChange,
  onMaxPriceChange,
}: FilterSidebarProps) {
  const leftPercent = ((minPrice - 3200) / (206000 - 3200)) * 100;
  const rightPercent = ((maxPrice - 3200) / (206000 - 3200)) * 100;

  return (
    <aside className="w-full border-b border-[#e8e1da] px-6 py-8 lg:w-[215px] lg:border-b-0 lg:border-r">
      <section className="pb-8">
        <h2 className="mb-5 text-[15px] font-semibold text-[#1d1d1d]">
          Category
        </h2>
        <div className="space-y-3">
          {HOTEL_CATEGORIES.map((category) => (
            <CheckboxRow
              key={category}
              checked={selectedCategories.includes(category)}
              label={category}
              onChange={() => onCategoryToggle(category)}
            />
          ))}
        </div>
      </section>

      <div className="my-0 h-px bg-[#ebe3dd]" />

      <section className="py-8">
        <h2 className="mb-3 text-[15px] font-semibold text-[#1d1d1d]">
          Price Range
        </h2>
        <p className="mb-5 text-sm text-[#2f2f2f]">
          ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}
        </p>

        <div className="relative px-2 pb-3">
          <div className="mb-4 flex h-10 items-end justify-between gap-1">
            {PRICE_BARS.map((bar) => (
              <span
                key={bar.id}
                className="w-full rounded-t-sm bg-[#ffbf93]"
                style={{ height: `${bar.height}px` }}
              />
            ))}
          </div>
          <div className="relative h-1 rounded-full bg-[#ffd7bd]">
            <div
              className="absolute h-1 rounded-full bg-[#ff6a00]"
              style={{
                left: `${leftPercent}%`,
                width: `${Math.max(rightPercent - leftPercent, 4)}%`,
              }}
            />
            <span
              className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-[#ff6a00] shadow"
              style={{ left: `calc(${leftPercent}% - 8px)` }}
            />
            <span
              className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-[#ff6a00] shadow"
              style={{ left: `calc(${rightPercent}% - 8px)` }}
            />
          </div>
          <input
            type="range"
            min={3200}
            max={206000}
            step={100}
            value={minPrice}
            onChange={(event) =>
              onMinPriceChange(Math.min(Number(event.target.value), maxPrice))
            }
            className="absolute inset-x-0 top-0 h-full w-full appearance-none bg-transparent opacity-0 cursor-pointer"
          />
          <input
            type="range"
            min={3200}
            max={206000}
            step={100}
            value={maxPrice}
            onChange={(event) =>
              onMaxPriceChange(Math.max(Number(event.target.value), minPrice))
            }
            className="absolute inset-x-0 top-0 h-full w-full appearance-none bg-transparent opacity-0 cursor-pointer"
          />
        </div>
      </section>

      <div className="my-0 h-px bg-[#ebe3dd]" />

      <section className="pt-8">
        <h2 className="mb-5 text-[15px] font-semibold text-[#1d1d1d]">
          Location
        </h2>
        <div className="space-y-3">
          {HOTEL_LOCATIONS.map((location) => (
            <CheckboxRow
              key={location}
              checked={selectedLocations.includes(location)}
              label={location}
              onChange={() => onLocationToggle(location)}
            />
          ))}
        </div>
      </section>
    </aside>
  );
}
