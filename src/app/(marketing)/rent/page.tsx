"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ApartmentListing } from "@/types/hotel";
import BedroomTabs from "@/components/listings/BedroomTabs";
import HotelHeader from "@/components/listings/HotelHeader";
import { DestinationCarousel } from "@/components/listings/destinations/DestinationCarousel";
import { CategoryFilterRow } from "@/components/listings/destinations/CategoryFilterRow";
import {
  APARTMENT_CATEGORIES,
  APARTMENT_LISTINGS,
} from "@/lib/mockData/apartmentListings";
import { STUB_DESTINATIONS } from "@/lib/mockData/destinations";
import { NearMeButton } from "@/components/listings/NearMeButton";
import {
  GeolocationProvider,
  useRequiredSharedGeolocation,
} from "@/providers/GeolocationProvider";
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
import { normalizeSearchText } from "@/lib/text";
import { DEMO_PLACES } from "@/lib/mockData/places";
import { whereSuggestions } from "@/features/listings/search/where-suggestions";
import {
  resolveSortOption,
  useRentFilters,
} from "@/components/listings/filters/useRentFilters";
import Link from "next/link";
import { RentMotion, RentReveal } from "@/components/listings/RentMotion";
import { normalizeSearchText } from "@/lib/searchText";

const ApartmentGrid = dynamic(
  () => import("@/components/listings/ApartmentGrid"),
  {
    ssr: false,
    loading: () => (
      <div role="status" aria-label="Loading apartments">
        <span className="sr-only">Loading apartments…</span>
        <div
          aria-hidden="true"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-border"
            >
              <div className="h-40 bg-muted motion-safe:animate-pulse" />
              <div className="space-y-2 p-3">
                <div className="h-4 w-24 rounded bg-muted motion-safe:animate-pulse" />
                <div className="h-3 w-36 max-w-full rounded bg-muted motion-safe:animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
);

const FilterSidebar = dynamic(
  () => import("@/components/listings/FilterSidebar"),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        aria-label="Loading price filters"
        className="w-64 max-w-full shrink-0 p-6"
      >
        <span className="sr-only">Loading price filters…</span>
        <div aria-hidden="true" className="space-y-6">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="space-y-3">
              <div className="h-4 w-20 rounded bg-muted motion-safe:animate-pulse" />
              {Array.from({ length: 3 }, (_, row) => (
                <div
                  key={row}
                  className="h-3 w-28 rounded bg-muted motion-safe:animate-pulse"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
  },
);

function RentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const normalizedQuery = normalizeSearchText(query);
  const placeParam = searchParams.get("place")?.trim() ?? "";
  const geo = useRequiredSharedGeolocation();
  const [sortFallback, setSortFallback] = useState(
    () => searchParams.get("sort") === "nearest",
  );
  const { filters, setFilters, reset, activeCount } = useRentFilters();
  const validPlaceId = useMemo(() => {
    if (!placeParam) return null;
    const place = DEMO_PLACES.find((candidate) => candidate.id === placeParam);
    if (!place) return null;
    if (filters.location && place.province !== filters.location) return null;
    return place.id;
  }, [filters.location, placeParam]);
  const destinationCounts = useMemo(
    () =>
      APARTMENT_LISTINGS.reduce<Record<string, number>>((counts, listing) => {
        counts[listing.location] = (counts[listing.location] ?? 0) + 1;
        return counts;
      }, {}),
    [],
  );
  const selectedDestinationId =
    STUB_DESTINATIONS.find(
      (destination) => destination.location === filters.location,
    )?.id ?? null;
  const [whereText, setWhereText] = useState("");
  const [whereActive, setWhereActive] = useState(-1);
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

  const whereListId = "where-suggestions";
  const whereOpen = whereText.trim().length > 0;
  const whereResults = useMemo(
    () => (whereOpen ? whereSuggestions(whereText, APARTMENT_LISTINGS) : []),
    [whereOpen, whereText],
  );
  const activeWhere = whereActive >= 0 && whereActive < whereResults.length
    ? whereActive
    : -1;

  useEffect(() => {
    if (!placeParam) return;
    if (validPlaceId) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("place");
    const next = params.toString();
    router.replace(next ? `/rent?${next}` : "/rent", { scroll: false });
  }, [placeParam, router, searchParams, validPlaceId]);

  useEffect(() => {
    if (!geo.position) {
      previousAutoSortPosition.current = null;
      if (geo.status !== "prompting" && filters.sort === "nearest") {
        setSortFallback(true);
        setFilters({ sort: "relevance" });
      }
      return;
    }
    if (!geo.autoSortOnPosition && filters.sort !== "nearest") return;

    setSortFallback(false);
    if (previousAutoSortPosition.current === geo.position) return;

    previousAutoSortPosition.current = geo.position;
    const sort = isOutsideCostaRica ? "relevance" : "nearest";
    if (filters.sort !== sort) setFilters({ sort });
  }, [
    filters.sort,
    geo.autoSortOnPosition,
    geo.position,
    geo.status,
    isOutsideCostaRica,
    setFilters,
  ]);

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
    ).filter(
      (apartment) =>
        validPlaceId === null || apartment.placeId === validPlaceId,
    );
    if (effectiveSort === "nearest" && geo.position) {
      return sortByDistance(
        filtered,
        geo.position,
        (apartment) => apartment.coordinates,
      );
    }
    return filtered;
  }, [effectiveSort, filters, geo.position, normalizedQuery, validPlaceId]);

  const applyWhereChoice = (suggestion: NonNullable<ReturnType<typeof whereSuggestions>[number]>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (suggestion.kind === "province") {
      setFilters({ location: suggestion.location });
      params.delete("place");
      params.delete("q");
    } else if (suggestion.kind === "place") {
      setFilters({ location: suggestion.place.province });
      params.set("location", suggestion.place.province);
      params.set("place", suggestion.place.id);
      params.delete("q");
    } else {
      const listing = APARTMENT_LISTINGS.find((item) => item.id === suggestion.id);
      if (listing) {
        setFilters({ location: listing.location });
        params.set("location", listing.location);
        if (listing.placeId) params.set("place", listing.placeId);
        else params.delete("place");
        params.set("q", listing.name);
      }
    }
    const next = params.toString();
    router.replace(next ? `/rent?${next}` : "/rent", { scroll: false });
    setWhereText("");
    setWhereActive(-1);
  };

  const handleWhereKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!whereOpen) {
      if (event.key === "Escape") {
        event.currentTarget.blur();
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setWhereActive((current) => {
        const next = current + 1;
        return next >= whereResults.length ? 0 : next;
      });
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setWhereActive((current) => {
        const next = current - 1;
        return next < 0 ? whereResults.length - 1 : next;
      });
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeWhere >= 0) {
        applyWhereChoice(whereResults[activeWhere]);
      } else {
        const params = new URLSearchParams(searchParams.toString());
        params.set("q", whereText.trim());
        params.delete("place");
        router.replace(`/rent?${params.toString()}`, { scroll: false });
        setWhereText("");
        setWhereActive(-1);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      setWhereText("");
      setWhereActive(-1);
    } else if (event.key === "Tab") {
      setWhereText("");
      setWhereActive(-1);
    }
  };

  const handleApartmentClick = (apartment: ApartmentListing) => {
    router.push(`/rent/${apartment.id}`);
  };

  const clearLocation = () => {
    if (filters.sort === "nearest") setSortFallback(true);
    geo.clear();
    if (placeParam) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("place");
      const next = params.toString();
      router.replace(next ? `/rent?${next}` : "/rent", { scroll: false });
    }
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
              {sortFallback && !geo.position && !isOutsideCostaRica ? (
                <p
                  className="mt-2 text-sm text-gray-600 dark:text-gray-300"
                  role="status"
                >
                  Sorted by relevance: share your location again to sort by
                  distance.
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-3 sm:p-4">
              <div className="min-w-0">
                <NearMeButton onClear={clearLocation} />
              </div>
              <div className="relative">
                <label htmlFor="where-input" className="sr-only">
                  Where
                </label>
                <input
                  id="where-input"
                  role="combobox"
                  aria-expanded={whereOpen}
                  aria-controls={whereListId}
                  aria-autocomplete="list"
                  aria-activedescendant={
                    activeWhere >= 0 ? `${whereListId}-${activeWhere}` : undefined
                  }
                  value={whereText}
                  onChange={(event) => {
                    setWhereText(event.target.value);
                    setWhereActive(-1);
                  }}
                  onKeyDown={handleWhereKeyDown}
                  placeholder="Where to?"
                  className="min-h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                />
                {whereOpen ? (
                  whereResults.length > 0 ? (
                    <ul
                      id={whereListId}
                      role="listbox"
                      aria-label="Destination suggestions"
                      className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border border-border bg-background shadow-lg"
                    >
                      {whereResults.map((suggestion, index) => (
                        <li
                          key={
                            suggestion.kind === "listing"
                              ? `listing-${suggestion.id}`
                              : suggestion.kind === "place"
                                ? `place-${suggestion.place.id}`
                                : `province-${suggestion.location}`
                          }
                          id={`${whereListId}-${index}`}
                          role="option"
                          aria-selected={index === activeWhere}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            applyWhereChoice(suggestion);
                          }}
                          className={cn(
                            "cursor-pointer px-3 py-2 text-sm",
                            index === activeWhere
                              ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                              : "text-foreground hover:bg-muted",
                          )}
                        >
                          {suggestion.label}{" "}
                          {suggestion.kind !== "listing" ? (
                            <span className="text-muted-foreground">
                              {suggestion.count} places
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-background p-3 text-sm shadow-lg">
                      <p className="text-muted-foreground">
                        No places match &lsquo;{whereText}&rsquo;
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setWhereText("");
                          setWhereActive(-1);
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                  )
                ) : null}
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
                          onClick={() => {
                            setSortFallback(false);
                            setFilters({ sort: option.value });
                          }}
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

          <div className="mt-6 space-y-4">
            <DestinationCarousel
              destinations={STUB_DESTINATIONS}
              selectedId={selectedDestinationId}
              counts={destinationCounts}
              onSelectDestination={(destination) => {
                const nextLocation = destination?.location ?? null;
                setFilters({ location: nextLocation });
                if (placeParam) {
                  const place = DEMO_PLACES.find(
                    (candidate) => candidate.id === placeParam,
                  );
                  if (!place || place.province !== nextLocation) {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("place");
                    const next = params.toString();
                    router.replace(next ? `/rent?${next}` : "/rent", {
                      scroll: false,
                    });
                  }
                }
              }}
            />
            <CategoryFilterRow
              categories={APARTMENT_CATEGORIES}
              value={filters.categories}
              onChange={(categories) => setFilters({ categories })}
              onToggleCategory={(category) =>
                setFilters((current) => ({
                  categories: current.categories.includes(category)
                    ? current.categories.filter((item) => item !== category)
                    : [...current.categories, category],
                }))
              }
            />
          </div>

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
                  <Button
                    variant="outline"
                    onClick={() => {
                      reset();
                      if (placeParam) {
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete("place");
                        const next = params.toString();
                        router.replace(next ? `/rent?${next}` : "/rent", {
                          scroll: false,
                        });
                      }
                    }}
                  >
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
    <GeolocationProvider>
      <Suspense
        fallback={
          <main className="min-h-screen bg-white px-6 py-12 dark:bg-slate-900" />
        }
      >
        <RentMotion>
          <RentPageContent />
        </RentMotion>
      </Suspense>
    </GeolocationProvider>
  );
}