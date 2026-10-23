"use client";

import { Suspense, useMemo } from "react";
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
import { useGeolocation } from "@/hooks/useGeolocation";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/layouts/PageContainer";
import { useRentFilters } from "@/components/listings/filters/useRentFilters";
import { LazyMotionProvider } from "@/components/ui/LazyMotionProvider";
import { RentReveal } from "@/components/listings/RentMotion";
import {
  WishlistAnnouncer,
  useSaveStay,
  selectRentResults,
  useNearestOnGrant,
} from "@/features/listings";
import { RentResultsHeader } from "@/components/listings/rent/RentResultsHeader";
import { RentToolbar } from "@/components/listings/rent/RentToolbar";
import {
  ApartmentGrid,
  FilterSidebar,
} from "@/components/listings/rent/RentAsyncComponents";

function RentPageContent() {
  const router = useRouter();
  const { isSaved, toggleSaved, announcement } = useSaveStay();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const geo = useGeolocation();
  const { filters, setFilters, reset, activeCount } = useRentFilters();

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

  const {
    results,
    sort: effectiveSort,
    canSortByDistance,
    outside: isOutsideCostaRica,
    distances,
  } = useMemo(
    () =>
      selectRentResults({
        listings: APARTMENT_LISTINGS,
        filters,
        query,
        position: geo.position,
      }),
    [filters, query, geo.position],
  );

  useNearestOnGrant(geo.position, isOutsideCostaRica, filters, setFilters);

  const handleApartmentClick = (apartment: ApartmentListing) => {
    router.push(`/rent/${apartment.id}`);
  };

  const clearLocation = () => {
    geo.clear();
    if (filters.sort === "nearest") setFilters({ sort: "relevance" });
  };

  return (
    <div className="theme-guest min-h-screen bg-background text-foreground">
      <HotelHeader />
      <WishlistAnnouncer message={announcement} />

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
            <RentResultsHeader
              location={filters.location}
              count={results.length}
              isOutsideCostaRica={isOutsideCostaRica}
            />

            <RentToolbar
              geo={geo}
              onClearLocation={clearLocation}
              filters={filters}
              setFilters={setFilters}
              reset={reset}
              activeCount={activeCount}
              resultCount={results.length}
              effectiveSort={effectiveSort}
              canSortByDistance={canSortByDistance}
            />
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
                favorites={results
                  .filter((a) => isSaved(a.id))
                  .map((a) => a.id)}
                onToggleFavorite={toggleSaved}
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
