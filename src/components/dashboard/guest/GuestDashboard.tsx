"use client";

import type { ApartmentListing } from "@/types/hotel";
import dynamic from "next/dynamic";
import BedroomTabs from "@/components/listings/BedroomTabs";

const ApartmentGrid = dynamic(
  () => import("@/components/listings/ApartmentGrid"),
);
import FilterSidebar from "@/components/listings/FilterSidebar";
import { SortMenu } from "@/components/listings/SortMenu";
import { APARTMENT_LISTINGS } from "@/lib/mockData/apartmentListings";
import { applyRentFilters } from "@/components/listings/filters/applyRentFilters";
import { useRentFilters } from "@/components/listings/filters/useRentFilters";
import { useRouter } from "next/navigation";
import GuestBookingsSummary from "./GuestBookingsSummary";

export default function GuestDashboard() {
  const router = useRouter();
  const { filters, setFilters, reset } = useRentFilters();
  const results = applyRentFilters(APARTMENT_LISTINGS, filters);
  const place = filters.location ?? "all of Costa Rica";

  const handleApartmentClick = (apartment: ApartmentListing) => {
    router.push(`/rent/${apartment.id}`);
  };

  return (
    <div className="mx-auto mt-6 flex w-full max-w-screen-2xl flex-col overflow-hidden rounded-[20px] border border-border bg-card shadow-sm lg:flex-row">
      {/* Sidebar */}
      <FilterSidebar filters={filters} setFilters={setFilters} reset={reset} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-8 p-6 md:p-10">
        <div>
          <h1 className="text-[28px] text-foreground mb-1">
            Available for rent in <span className="font-bold">{place}</span>
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm" aria-live="polite">
              {results.length} {results.length === 1 ? "unit" : "units"} available
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
