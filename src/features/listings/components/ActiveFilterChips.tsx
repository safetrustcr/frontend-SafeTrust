"use client";

import { X } from "lucide-react";
import { DEFAULT_MAX_PRICE, DEFAULT_MIN_PRICE } from "@/lib/rent-filters";
import { formatListingPrice } from "./formatListingPrice";

interface ActiveFilterChipsProps {
  selectedCategories: string[];
  selectedLocations: string[];
  selectedBedrooms: string;
  minPrice: number;
  maxPrice: number;
  onRemoveCategory: (value: string) => void;
  onRemoveLocation: (value: string) => void;
  onRemoveBedrooms: () => void;
  onRemovePrice: () => void;
  onClearAll: () => void;
}

/** Render removable chips for each currently active rent filter. */
export default function ActiveFilterChips({
  selectedCategories,
  selectedLocations,
  selectedBedrooms,
  minPrice,
  maxPrice,
  onRemoveCategory,
  onRemoveLocation,
  onRemoveBedrooms,
  onRemovePrice,
  onClearAll,
}: ActiveFilterChipsProps) {
  const chips = [
    ...selectedLocations.map((value) => ({
      key: `location:${value}`,
      label: value,
      remove: () => onRemoveLocation(value),
    })),
    ...selectedCategories.map((value) => ({
      key: `category:${value}`,
      label: value,
      remove: () => onRemoveCategory(value),
    })),
    ...(selectedBedrooms !== "all"
      ? [
          {
            key: "bedrooms",
            label: `${selectedBedrooms}${selectedBedrooms === "3" ? "+" : ""} bedrooms`,
            remove: onRemoveBedrooms,
          },
        ]
      : []),
    ...(minPrice !== DEFAULT_MIN_PRICE || maxPrice !== DEFAULT_MAX_PRICE
      ? [
          {
            key: "price",
            label: `${formatListingPrice(minPrice)}–${formatListingPrice(maxPrice)}`,
            remove: onRemovePrice,
          },
        ]
      : []),
  ];

  if (chips.length === 0) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-2 py-3"
      aria-label="Active filters"
    >
      {chips.map(({ key, label, remove }) => (
        <button
          key={key}
          type="button"
          aria-label={`Remove filter: ${label}`}
          onClick={remove}
          className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs text-foreground hover:bg-muted"
        >
          {label}
          <X aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="min-h-8 px-2 text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Clear all
      </button>
    </div>
  );
}
