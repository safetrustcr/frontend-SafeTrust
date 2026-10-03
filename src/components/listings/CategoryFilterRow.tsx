"use client";

import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BEDROOM_FILTERS,
  HOTEL_CATEGORIES,
  HOTEL_LOCATIONS,
} from "@/lib/mockData/hotels";

interface CategoryFilterRowProps {
  selectedCategories: string[];
  selectedLocations: string[];
  selectedBedrooms: string;
  minPrice: number;
  maxPrice: number;
  onCategoryToggle: (category: string) => void;
  onLocationToggle: (location: string) => void;
  onBedroomSelect: (bedrooms: string) => void;
  onMinPriceChange: (price: number) => void;
  onMaxPriceChange: (price: number) => void;
  onReset?: () => void;
}

export default function CategoryFilterRow({
  selectedCategories,
  selectedLocations,
  selectedBedrooms,
  minPrice,
  maxPrice,
  onCategoryToggle,
  onLocationToggle,
  onBedroomSelect,
  onMinPriceChange,
  onMaxPriceChange,
  onReset,
}: CategoryFilterRowProps) {
  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedLocations.length > 0 ||
    selectedBedrooms !== "all" ||
    minPrice !== 3200 ||
    maxPrice !== 206000;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryToggle("")}
          className={cn(
            "text-xs px-3 py-1.5 rounded-lg transition-colors border flex items-center gap-1.5",
            selectedCategories.length === 0
              ? "bg-orange-500 border-orange-500 text-white"
              : "border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300",
          )}
        >
          {selectedCategories.length === 0 ? "a" : "+"}
          <span>All Categories</span>
        </button>
        {HOTEL_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryToggle(category)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-lg transition-colors border flex items-center gap-1.5",
              selectedCategories.includes(category)
                ? "bg-orange-500 border-orange-500 text-white"
                : "border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300",
            )}
          >
            {selectedCategories.includes(category) ? "a" : "+"}
            <span>{category}</span>
          </button>
        ))}
      </div>

      {/* Location Filters */}
      <div className="flex flex-wrap gap-2">
        {HOTEL_LOCATIONS.map((location) => (
          <button
            key={location}
            onClick={() => onLocationToggle(location)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-lg transition-colors border flex items-center gap-1.5",
              selectedLocations.includes(location)
                ? "bg-orange-500 border-orange-500 text-white"
                : "border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300",
            )}
          >
            {selectedLocations.includes(location) ? "a" : "+"}
            <span>{location}</span>
          </button>
        ))}
      </div>

      {/* Bedroom Filters */}
      <div className="flex flex-wrap gap-2">
        {BEDROOM_FILTERS.map((option) => (
          <button
            key={option.value}
            onClick={() => onBedroomSelect(option.value)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-lg transition-colors border flex items-center gap-1.5",
              selectedBedrooms === option.value
                ? "bg-orange-500 border-orange-500 text-white"
                : "border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300",
            )}
          >
            {selectedBedrooms === option.value ? "a" : "+"}
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {/* Advanced Filters Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="flex items-center gap-2 text-xs
                       border border-gray-200 dark:border-slate-700
                       rounded-full px-4 py-2 hover:bg-gray-50
                       dark:hover:bg-slate-800 transition-colors
                       text-gray-700 dark:text-gray-300"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Advanced</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-orange-500" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-72 p-4 space-y-4 max-h-[85vh] overflow-y-auto
                     bg-white dark:bg-slate-800
                     border border-gray-200 dark:border-slate-700"
        >
          {/* Price Range */}
          <div className="space-y-2">
            <p
              className="text-xs font-semibold uppercase tracking-wide
                          text-gray-500 dark:text-gray-400"
            >
              Price Range
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => onMinPriceChange(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-200
                           dark:border-slate-600 bg-white dark:bg-slate-900
                           px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300"
              />
              <span className="text-gray-400">—</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-200
                           dark:border-slate-600 bg-white dark:bg-slate-900
                           px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300"
              />
            </div>
          </div>

          {/* Reset Button */}
          {onReset && (
            <button
              onClick={onReset}
              className="w-full text-sm text-center text-orange-500
                         hover:text-orange-600 font-medium"
            >
              Reset filters
            </button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
