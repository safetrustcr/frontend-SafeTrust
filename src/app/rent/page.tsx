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
import { Drawer } from "vaul";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Check,
  LayoutDashboard,
  Lightbulb,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/layouts/PageContainer";
import { applyRentFilters } from "@/components/listings/filters/applyRentFilters";
import {
  resolveSortOption,
  useRentFilters,
} from "@/components/listings/filters/useRentFilters";
import Link from "next/link";
import { LazyMotionProvider } from "@/components/ui/LazyMotionProvider";
import { RentReveal } from "@/components/listings/RentMotion";

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

      <PageContainer width="wide" className="flex flex-col lg:flex-row">
        <div className="hidden shrink-0 lg:block">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            reset={reset}
          />
        </div>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <RentReveal className="space-y-5">
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

            <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-3 sm:p-4">
              <div className="min-w-0">
                <NearMeButton geo={geo} onClear={clearLocation} />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                {/* Below lg the sidebar is hidden: filters open in a bottom sheet. */}
                <Drawer.Root shouldScaleBackground={false}>
                  <Drawer.Trigger asChild>
                    <button
                      type="button"
                      aria-label={`Filters${activeCount ? `, ${activeCount} active` : ""}`}
                      className="inline-flex min-h-11 justify-center shrink-0 items-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted lg:hidden"
                    >
                      <SlidersHorizontal
                        aria-hidden="true"
                        className="mr-2 h-4 w-4"
                      />
                      Filters
                      {activeCount > 0 && (
                        <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-orange-700 px-1.5 text-xs text-white">
                          {activeCount}
                        </span>
                      )}
                    </button>
                  </Drawer.Trigger>
                  <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
                    <Drawer.Content
                      onOpenAutoFocus={(event) => {
                        event.preventDefault();
                        const content = event.currentTarget;
                        if (content instanceof HTMLElement) {
                          content
                            .querySelector<HTMLElement>("button, input")
                            ?.focus();
                        }
                      }}
                      style={{ maxHeight: "85dvh" }}
                      className="fixed inset-x-0 bottom-0 z-50 mt-24 flex max-h-screen flex-col rounded-t-2xl border border-border bg-background px-4 pt-3 outline-none sm:px-6"
                    >
                      <div className="mx-auto mb-3 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/30" />
                      <Drawer.Title className="pb-2 text-lg font-semibold text-foreground">
                        Filters
                      </Drawer.Title>
                      <Drawer.Description className="sr-only">
                        Choose rental filters and review the matching places.
                      </Drawer.Description>
                      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-4">
                        {/* Full width: the sidebar's fixed desktop width overflows phones. */}
                        <FilterSidebar
                          filters={filters}
                          setFilters={setFilters}
                          reset={reset}
                          className="w-full p-0"
                        />
                      </div>
                      <div className="sticky bottom-0 flex shrink-0 justify-end border-t border-border bg-background py-3">
                        <Drawer.Close asChild>
                          <Button>Show {results.length} places</Button>
                        </Drawer.Close>
                      </div>
                    </Drawer.Content>
                  </Drawer.Portal>
                </Drawer.Root>

                <Button
                  asChild
                  variant="outline"
                  className="min-h-11 h-auto whitespace-normal text-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm"
                >
                  <Link href="/guest/suggestions">
                    <Lightbulb
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0"
                    />
                    Suggestions view
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="min-h-11 h-auto whitespace-normal text-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm"
                >
                  <Link href="/dashboard">
                    <LayoutDashboard
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0"
                    />
                    Switch to host view
                  </Link>
                </Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      aria-label={`Sort${activeCount ? `, ${activeCount} active filters` : ""}`}
                      className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
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
          </RentReveal>

          <RentReveal delay={0.05} className="mt-5">
            <BedroomTabs
              selected={filters.bedrooms}
              onSelect={(bedrooms) => setFilters({ bedrooms })}
            />
          </RentReveal>

          <div className="mt-6 sm:mt-8">
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
                renderCard={(card, index) => (
                  <RentReveal
                    className="h-full min-w-0"
                    delay={(index % 3) * 0.04}
                  >
                    {card}
                  </RentReveal>
                )}
                distances={distances}
                onApartmentClick={handleApartmentClick}
              />
            )}
          </div>
        </main>
      </PageContainer>
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
      <LazyMotionProvider>
        <RentPageContent />
      </LazyMotionProvider>
    </Suspense>
  );
}
