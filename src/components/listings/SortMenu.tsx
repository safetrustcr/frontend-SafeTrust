"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { SortOption } from "./filters/useRentFilters";

const LABELS: Record<SortOption, string> = {
  relevance: "Relevance",
  "price-low": "Price: Low to High",
  "price-high": "Price: High to Low",
  nearest: "Nearest",
};

export function SortMenu({
  value,
  onChange,
  canSortByDistance = false,
}: {
  value: SortOption;
  onChange: (next: SortOption) => void;
  canSortByDistance?: boolean;
}) {
  const options: SortOption[] = [
    "relevance",
    "price-low",
    "price-high",
    ...(canSortByDistance ? (["nearest"] as const) : []),
  ];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Sort by: ${LABELS[value]}`}
          className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-sm font-medium text-foreground hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="text-muted-foreground">Sort by:</span>{" "}
          {LABELS[value]}
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60 p-2">
        <div role="group" aria-label="Sort results">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={value === option}
              onClick={() => onChange(option)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-muted",
                value === option &&
                  "font-medium text-foreground dark:text-foreground",
              )}
            >
              {LABELS[option]}
              {value === option && (
                <Check className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
