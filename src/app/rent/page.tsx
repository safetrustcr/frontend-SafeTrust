"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import type { ApartmentListing } from "@/types/hotel";
import {
  ApartmentGrid,
  BedroomTabs,
  FilterSidebar,
  HotelHeader,
} from "@/components/listings";
import { APARTMENT_LISTINGS } from "@/lib/mockData/apartmentListings";
import { NearMeButton } from "@/components/listings/NearMeButton";
import { useGeolocation } from "@/hooks/useGeolocation";
import { distanceKm, sortByDistance } from "@/lib/geo";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Check, LayoutDashboard, Lightbulb, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { applyRentFilters } from "@/components/listings/filters/applyRentFilters";
import {
  resolveSortOption,
  useRentFilters,
} from "@/components/listings/filters/useRentFilters";
import Link from "next/link";

const normalizeSearchText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase();

function RentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const normalizedQuery = normalizeSearchText(query);
  const geo = useGeolocation();
  const { filters, setFilters, reset, activeCount } = useRentFilters();
  const previousAutoSortPosition = useRef(geo.position);

  const isOutsideCostaRica = useMemo(() => {
    const position = geo.position;
    if (!position) return false;
    const nearestListingKm = Math.min(
      ...APARTMENT_LISTINGS.map((apartment) =>
        distanceKm(position, apartment.coordinates),
      ),
    );
    return nearestListingKm > 300;
  }, [geo.position]);
  const canSortByDistance = Boolean(geo.position && !isOutsideCostaRica);
  const effectiveSort = resolveSortOption(filters.sort, canSortByDistance);

  useEffect(() => {
    if (!geo.position) {
      previousAutoSortPosition.current = null;
      if (geo.status !== "prompting" && filters.sort === "nearest") {
        setFilters({ sort: "relevance" });
      }
      return;
    }
    if (previousAutoSortPosition.current === geo.position) return;

    previousAutoSortPosition.current = geo.position;
    const sort = isOutsideCostaRica ? "relevance" : "nearest";
    if (filters.sort !== sort) setFilters({ sort });
  }, [filters.sort, geo.position, geo.status, isOutsideCostaRica, setFilters]);

  const distances = useMemo(
    () =>
      geo.position
        ? Object.fromEntries(
            APARTMENT_LISTINGS.map((apartment) => [
              apartment.id,
              distanceKm(geo.position!, apartment.coordinates),
            ]),
          )
        : undefined,
    [geo.position],
  );

  const results = useMemo(() => {
    const filtered = applyRentFilters(APARTMENT_LISTINGS, {
      ...filters,
      sort: effectiveSort,
    }).filter(
      (apartment) =>
        normalizedQuery.length === 0 ||
        normalizeSearchText(`${apartment.name} ${apartment.address}`).includes(
          normalizedQuery,
        ),
    );
    if (effectiveSort === "nearest" && geo.position) {
      return sortByDistance(
        filtered,
        geo.position,
        (apartment) => apartment.coordinates,
      );
    }
    return filtered;
  }, [effectiveSort, filters, geo.position, normalizedQuery]);

  const handleApartmentClick = (apartment: ApartmentListing) => {
    router.push(`/rent/${apartment.id}`);
  };

  const clearLocation = () => {
    geo.clear();
    if (filters.sort === "nearest") setFilters({ sort: "relevance" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HotelHeader />

      <div className="mx-auto flex max-w-[1180px] flex-col lg:flex-row">
        <div className="hidden lg:block">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            reset={reset}
          />
        </div>

        <main className="flex-1 px-6 py-8 lg:px-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-[24px] leading-tight text-gray-900 dark:text-white sm:text-[30px]">
                Available for rent in{" "}
                <span className="font-semibold">
                  {filters.location ?? "Costa Rica"}
                </span>
              </h1>
              <p
                className="mt-3 text-sm text-gray-600 dark:text-gray-400"
                aria-live="polite"
              >
                {results.length} {results.length === 1 ? "unit" : "units"}{" "}
                available
              </p>
              {isOutsideCostaRica ? (
                <p
                  className="mt-2 text-sm text-gray-600 dark:text-gray-300"
                  role="status"
                >
                  You seem to be outside Costa Rica, so we&apos;re showing
                  popular destinations.
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <NearMeButton geo={geo} onClear={clearLocation} />

              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-1.5 text-sm font-medium text-orange-700 hover:text-orange-800 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Switch to Host view
              </button>

              <Link
                href="/guest/suggestions"
                className="flex items-center gap-1.5 text-sm font-medium text-orange-700 transition-colors hover:text-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <Lightbulb aria-hidden="true" className="h-4 w-4" />
                Suggestions view
              </Link>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    aria-label={`Sort${activeCount ? `, ${activeCount} active filters` : ""}`}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Sort</span>
                    {activeCount > 0 ? (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
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
                            ? "bg-orange-50 font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
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

          <div className="mt-6">
            <BedroomTabs
              selected={filters.bedrooms}
              onSelect={(bedrooms) => setFilters({ bedrooms })}
            />
          </div>

          <div className="mt-8">
            {results.length === 0 ? (
              <EmptyState
                title="No places match these filters"
                description="Try another destination or widen the price range."
                action={
                  <Button variant="outline" onClick={reset}>
                    Clear all filters
                  </Button>
                }
              />
            ) : (
              <ApartmentGrid
                apartments={results}
                distances={distances}
                onApartmentClick={handleApartmentClick}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function HotelListingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white px-6 py-12 dark:bg-slate-900" />
      }
    >
      <RentPageContent />
    </Suspense>
  );
}
