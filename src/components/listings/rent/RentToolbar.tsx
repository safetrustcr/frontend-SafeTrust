"use client";

import Link from "next/link";
import {
  Check,
  LayoutDashboard,
  Lightbulb,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NearMeButton } from "@/components/listings/NearMeButton";
import { MobileFiltersDrawer } from "./MobileFiltersDrawer";
import type { useGeolocation } from "@/hooks/useGeolocation";
import type {
  RentFilters,
  SortOption,
} from "@/components/listings/filters/useRentFilters";
import { cn } from "@/lib/utils";

export interface RentToolbarProps {
  geo: ReturnType<typeof useGeolocation>;
  onClearLocation: () => void;
  filters: RentFilters;
  setFilters: (
    filters:
      Partial<RentFilters> | ((current: RentFilters) => Partial<RentFilters>),
  ) => void;
  reset: () => void;
  activeCount: number;
  resultCount: number;
  effectiveSort: SortOption;
  canSortByDistance: boolean;
  helpSlot?: React.ReactNode;
}

export function RentToolbar({
  geo,
  onClearLocation,
  filters,
  setFilters,
  reset,
  activeCount,
  resultCount,
  effectiveSort,
  canSortByDistance,
  helpSlot,
}: RentToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-3 sm:p-4">
      <div className="min-w-0">
        <NearMeButton geo={geo} onClear={onClearLocation} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        {/* Below lg the sidebar is hidden: filters open in a bottom sheet. */}
        <MobileFiltersDrawer
          filters={filters}
          setFilters={setFilters}
          reset={reset}
          activeCount={activeCount}
          resultCount={resultCount}
        />

        <Button
          asChild
          variant="outline"
          className="min-h-11 h-auto whitespace-normal text-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm"
        >
          <Link href="/guest/suggestions">
            <Lightbulb aria-hidden="true" className="h-4 w-4 shrink-0" />
            Suggestions view
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="min-h-11 h-auto whitespace-normal text-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm"
        >
          <Link href="/dashboard">
            <LayoutDashboard aria-hidden="true" className="h-4 w-4 shrink-0" />
            Switch to host view
          </Link>
        </Button>

        {helpSlot}

        <Popover>
          <PopoverTrigger asChild>
            <button
              aria-label={`Sort${activeCount ? `, ${activeCount} active filters` : ""}`}
              className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Sort</span>
              {activeCount > 0 ? (
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                  {activeCount}
                </span>
              ) : null}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-64 space-y-2 border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="space-y-1">
              <p className="px-3 pb-1 text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                Sort
              </p>
              {(
                [
                  { label: "Relevance", value: "relevance" },
                  { label: "Price: Low to High", value: "price-low" },
                  { label: "Price: High to Low", value: "price-high" },
                  ...(canSortByDistance
                    ? [{ label: "Nearest", value: "nearest" as const }]
                    : []),
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilters({ sort: option.value })}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors",
                    effectiveSort === option.value
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700",
                  )}
                >
                  {option.label}
                  {effectiveSort === option.value ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : null}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
