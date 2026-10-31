"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ApartmentListing } from "@/types/hotel";
import BedroomTabs from "@/components/listings/BedroomTabs";
import HotelHeader from "@/components/listings/HotelHeader";
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
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  BookOpen,
  LayoutDashboard,
  Lightbulb,
  SlidersHorizontal,
} from "lucide-react";
import { PageContainer } from "@/components/layouts/PageContainer";
import {
  resolveSortOption,
  useRentFilters,
} from "@/components/listings/filters/useRentFilters";
import { SortMenu } from "@/components/listings/SortMenu";
import Link from "next/link";
import { RentMotion, RentReveal } from "@/components/listings/RentMotion";
import { useSaveStay } from "@/features/listings/wishlist/useSaveStay";
import { WishlistAnnouncer } from "@/features/listings/wishlist/WishlistAnnouncer";
import { useListingResults } from "@/features/listings/search/useListingResults";
import { listingHref } from "@/features/listings/search/links";
import { RentHelpPanel } from "@/features/help";
import {
  applyStaySearch,
  ListingResultsMap,
  useStaySearch,
} from "@/features/listings";
import { cn } from "@/lib/utils";

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

const DestinationCarousel = dynamic(
  () =>
    import("@/components/listings/destinations/DestinationCarousel").then(
      (module) => module.DestinationCarousel,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        aria-label="Loading destinations"
        className="mt-6 h-[168px] animate-pulse rounded-xl bg-muted"
      />
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

const RentFiltersDrawer = dynamic(
  () => import("@/components/listings/filters/RentFiltersDrawer"),
  {
    ssr: false,
    loading: () => (
      <button
        type="button"
        disabled
        aria-label="Filters"
        className="inline-flex min-h-11 justify-center shrink-0 items-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground lg:hidden"
      >
        <SlidersHorizontal aria-hidden="true" className="mr-2 h-4 w-4" />
        Filters
      </button>
    ),
  },
);

function RentPageContent() {
  const router = useRouter();
  const { isSaved, toggleSaved, announcement } = useSaveStay();
  const searchParams = useSearchParams();
  const geo = useRequiredSharedGeolocation();
  const [sortFallback, setSortFallback] = useState(
    () => searchParams.get("sort") === "nearest",
  );
  const { filters, setFilters, reset, activeCount } = useRentFilters();
  // The help panel overlays without rerouting, so filters/URL/scroll survive.
  const [helpOpen, setHelpOpen] = useState(false);
  // Exactly one launcher is visible per viewport; track both so the panel can
  // return focus to whichever one opened it (Radix cannot: it doesn't own the
  // launcher buttons when the sheet is used as a controlled component).
  const desktopHelpRef = useRef<HTMLButtonElement>(null);
  const mobileHelpRef = useRef<HTMLButtonElement>(null);
  const restoreHelpFocus = useMemo(
    () => () =>
      // 1024px = Tailwind's `lg`, matching the launcher CSS breakpoints.
      (window.innerWidth >= 1024 && desktopHelpRef.current) ||
      mobileHelpRef.current,
    [],
  );
  const filteredResults = useListingResults(APARTMENT_LISTINGS, filters);
  const { search, today } = useStaySearch();
  // The listing highlighted by hovering its card or picking its map pin.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const previousAutoSortPosition = useRef(geo.position);
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

  const isFarFromListings = useMemo(() => {
    const position = geo.position;
    if (!position) return false;
    const nearestListingKm = Math.min(
      ...APARTMENT_LISTINGS.map((apartment) =>
        distanceKm(position, apartment.coordinates),
      ),
    );
    return nearestListingKm > 300;
  }, [geo.position]);
  const canSortByDistance = Boolean(geo.position && !isFarFromListings);
  const effectiveSort = resolveSortOption(filters.sort, canSortByDistance);

  useEffect(() => {
    if (!geo.position) {
      previousAutoSortPosition.current = null;
      // A shared ?sort=nearest link stays in the URL: the list falls back to
      // relevance (resolveSortOption) until the visitor shares a location.
      if (geo.status !== "prompting" && filters.sort === "nearest") {
        setSortFallback(true);
      }
      return;
    }
    if (geo.autoSortOnPosition === false && filters.sort !== "nearest") return;

    setSortFallback(false);
    if (previousAutoSortPosition.current === geo.position) return;

    previousAutoSortPosition.current = geo.position;
    // Only the default sort follows the location; a sort the user picked stays.
    if (filters.sort !== "relevance" && filters.sort !== "nearest") return;
    const sort = isFarFromListings ? "relevance" : "nearest";
    if (filters.sort !== sort) setFilters({ sort });
  }, [
    filters.sort,
    geo.autoSortOnPosition,
    geo.position,
    geo.status,
    isFarFromListings,
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
    const sorted =
      effectiveSort === "nearest" && geo.position
        ? sortByDistance(
            filteredResults,
            geo.position,
            (apartment) => apartment.coordinates,
          )
        : filteredResults;
    // Flexible-stay search (dates, nights, tolerance) from the composer.
    return applyStaySearch(sorted, search, today);
  }, [effectiveSort, filteredResults, geo.position, search, today]);

  const clearSearchAndFilters = () => {
    const query = new URLSearchParams(searchParams.toString());
    for (const key of [
      "q",
      "categories",
      "location",
      "bedrooms",
      "min",
      "max",
      "sort",
    ]) {
      query.delete(key);
    }
    const queryString = query.toString();
    router.replace(queryString ? `/rent?${queryString}` : "/rent", {
      scroll: false,
    });
  };

  const handleApartmentClick = (apartment: ApartmentListing) => {
    router.push(
      listingHref(
        `/rent/${apartment.id}`,
        new URLSearchParams(searchParams.toString()),
      ),
    );
  };

  // A pin selected on the results map scrolls to and highlights its card.
  useEffect(() => {
    if (!selectedId) return;
    document
      .getElementById(`listing-card-${selectedId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedId]);

  const clearLocation = () => {
    if (filters.sort === "nearest") setSortFallback(true);
    geo.clear();
    if (filters.sort === "nearest") setFilters({ sort: "relevance" });
  };

  return (
    <div className="theme-guest min-h-screen bg-background text-foreground">
      <HotelHeader listingSearchParams={searchParams.toString()} />
      <WishlistAnnouncer message={announcement} />

      {/* lg+ launcher: a vertical tab on the right edge. Kept below the header
          (z-50), the filter drawer (z-40/z-50) and dialogs (z-[90]/[100]), and
          it shares the edge with the scrollbar only in a narrow band that
          leaves the rest of the scrollbar usable. */}
      <button
        ref={desktopHelpRef}
        type="button"
        aria-haspopup="dialog"
        onClick={() => setHelpOpen(true)}
        className="fixed right-0 top-1/2 z-30 hidden -translate-y-1/2 items-center gap-2 rounded-l-lg border border-r-0 border-border bg-background/95 px-1.5 py-4 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none [writing-mode:vertical-rl] lg:flex"
      >
        <BookOpen
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-orange-700 dark:text-orange-400"
        />
        Help &amp; docs
      </button>

      {/* lg:pr-14 keeps the last card column clear of the fixed Help & docs tab. */}
      <PageContainer
        width="wide"
        className="flex flex-col lg:flex-row lg:pr-14"
      >
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
                  {filters.location ?? "all destinations"}
                </span>
              </h1>
              <p
                className="mt-3 text-sm text-gray-600 dark:text-gray-400"
                aria-live="polite"
              >
                {results.length} {results.length === 1 ? "unit" : "units"}{" "}
                available
              </p>
              {search.dates.mode !== "any" ? (
                <p className="mt-2 text-sm text-muted-foreground" role="status">
                  Demo availability — confirm dates with the host.
                </p>
              ) : null}
              {isFarFromListings ? (
                <p
                  className="mt-2 text-sm text-gray-600 dark:text-gray-300"
                  role="status"
                >
                  There are no listings within 300 km of you yet, so we&apos;re
                  showing popular destinations.
                </p>
              ) : null}
              {sortFallback && !geo.position && !isFarFromListings ? (
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
                <NearMeButton geo={geo} onClear={clearLocation} />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                {/* Below lg the sidebar is hidden: filters open in a bottom sheet. */}
                <RentFiltersDrawer
                  filters={filters}
                  setFilters={setFilters}
                  reset={reset}
                  activeCount={activeCount}
                  resultCount={results.length}
                />

                {/* Below lg the help launcher lives in the toolbar instead of
                    a floating tab, so it never covers listing cards. */}
                <button
                  ref={mobileHelpRef}
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => setHelpOpen(true)}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none lg:hidden"
                >
                  <BookOpen aria-hidden="true" className="h-4 w-4 shrink-0" />
                  Help
                </button>

                <Button
                  asChild
                  variant="outline"
                  className="min-h-11 h-auto whitespace-normal text-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm"
                >
                  <Link
                    href={listingHref(
                      "/guest/suggestions",
                      new URLSearchParams(searchParams.toString()),
                    )}
                  >
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

                <SortMenu
                  value={effectiveSort}
                  onChange={(sort) => {
                    setSortFallback(false);
                    setFilters({ sort });
                  }}
                  canSortByDistance={canSortByDistance}
                />
              </div>
            </div>
          </RentReveal>

          <div className="mt-6 space-y-4">
            <DestinationCarousel
              destinations={STUB_DESTINATIONS}
              selectedId={selectedDestinationId}
              counts={destinationCounts}
              onSelectDestination={(destination) =>
                setFilters({ location: destination?.location ?? null })
              }
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

          <div className="mt-6 sm:mt-8 lg:flex lg:items-start lg:gap-6">
            <div className="min-w-0 flex-1">
              {results.length === 0 ? (
                <EmptyState
                  title="No places match these filters"
                  description="Try another destination or widen the price range."
                  action={
                    <Button variant="outline" onClick={clearSearchAndFilters}>
                      Clear search and filters
                    </Button>
                  }
                />
              ) : (
                <ApartmentGrid
                  apartments={results}
                  renderCard={(card, index) => {
                    const apartment = results[index];
                    return (
                      <div
                        id={`listing-card-${apartment.id}`}
                        onMouseEnter={() => setSelectedId(apartment.id)}
                        onFocus={() => setSelectedId(apartment.id)}
                        className={cn(
                          "h-full min-w-0 rounded-[18px]",
                          selectedId === apartment.id &&
                            "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                        )}
                      >
                        <RentReveal
                          className="h-full min-w-0"
                          delay={(index % 3) * 0.04}
                        >
                          {card}
                        </RentReveal>
                      </div>
                    );
                  }}
                  distances={distances}
                  favorites={results
                    .filter((a) => isSaved(a.id))
                    .map((a) => a.id)}
                  onToggleFavorite={toggleSaved}
                  onApartmentClick={handleApartmentClick}
                  listingSearchParams={searchParams.toString()}
                />
              )}
            </div>
            <ListingResultsMap
              listings={results}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </main>
      </PageContainer>

      <RentHelpPanel
        open={helpOpen}
        onOpenChange={setHelpOpen}
        restoreFocusTo={restoreHelpFocus}
      />
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
