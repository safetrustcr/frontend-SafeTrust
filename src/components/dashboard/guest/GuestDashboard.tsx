"use client";

import {
  type Listing,
  ApartmentGrid,
  BedroomTabs,
  FilterSidebar,
  SortMenu,
  listListings,
  applyRentFilters,
  describeLocations,
  useRentFilters,
} from "@/features/listings";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const GuestBookingsSummary = dynamic(() => import("./GuestBookingsSummary"), {
  loading: () => (
    <div
      className="h-36 animate-pulse rounded-lg bg-muted"
      aria-label="Loading bookings"
    />
  ),
});

export default function GuestDashboard() {
  const router = useRouter();
  const { filters, setFilters, reset } = useRentFilters();
  const results = applyRentFilters(listListings(), filters);
  const place = describeLocations(filters.locations);

  const handleApartmentClick = (apartment: Listing) => {
    router.push(`/rent/${apartment.id}`);
  };

  return (
    <div className="mx-auto mt-6 flex w-full max-w-screen-2xl flex-col overflow-hidden rounded-[20px] border border-border bg-card shadow-sm lg:flex-row">
      {/* Sidebar */}
      <FilterSidebar
        filters={filters}
        setFilters={setFilters}
        reset={reset}
        listings={listListings()}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-8 p-6 md:p-10">
        <div>
          <h1 className="text-[28px] text-foreground mb-1">
            Available for rent in <span className="font-bold">{place}</span>
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm" aria-live="polite">
              {results.length} {results.length === 1 ? "unit" : "units"}{" "}
              available
            </p>
            <div className="flex items-center text-sm font-medium">
              <SortMenu
                value={filters.sort === "nearest" ? "relevance" : filters.sort}
                onChange={(sort) => setFilters({ sort })}
              />
            </div>
          </div>
        </div>

        <BedroomTabs
          selected={filters.bedrooms}
          onSelect={(bedrooms) => setFilters({ bedrooms })}
        />

        <ApartmentGrid
          apartments={results}
          onApartmentClick={handleApartmentClick}
        />

        <div className="mt-6">
          <GuestBookingsSummary />
        </div>
      </main>
    </div>
  );
}
