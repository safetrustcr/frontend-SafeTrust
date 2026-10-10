"use client";

import type { ApartmentListing } from "@/types/hotel";
import ApartmentGrid from "@/components/listings/ApartmentGrid";
import BedroomTabs from "@/components/listings/BedroomTabs";
import FilterSidebar from "@/components/listings/FilterSidebar";
import { APARTMENT_LISTINGS } from "@/lib/mockData/apartmentListings";
import {
  DEFAULT_FILTERS,
  type RentFilters,
} from "@/components/listings/filters/useRentFilters";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowDownWideNarrow } from "lucide-react";
import GuestBookingsSummary from "./GuestBookingsSummary";

const GUEST_PRICES = APARTMENT_LISTINGS.map((apartment) => apartment.price);
const GUEST_DEFAULT_FILTERS: RentFilters = {
  ...DEFAULT_FILTERS,
  minPrice: Math.min(...GUEST_PRICES),
  maxPrice: Math.max(...GUEST_PRICES),
};

export default function GuestDashboard() {
  const router = useRouter();
  const [filters, setFilterState] = useState<RentFilters>(
    GUEST_DEFAULT_FILTERS,
  );
  const setFilters = (patch: Partial<RentFilters>) =>
    setFilterState((current) => ({ ...current, ...patch }));
  const reset = () => setFilterState(GUEST_DEFAULT_FILTERS);

  const handleApartmentClick = (apartment: ApartmentListing) => {
    router.push(`/rent/${apartment.id}`);
  };

  // Derived filtered state
  const filteredApartments = APARTMENT_LISTINGS.filter((apt) => {
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(apt.category)
    ) {
      return false;
    }
    if (filters.location !== null && apt.location !== filters.location) {
      return false;
    }
    if (filters.bedrooms !== "all") {
      const target = Number(filters.bedrooms);
      if (filters.bedrooms === "3") {
        if (apt.bedrooms < 3) return false;
      } else if (apt.bedrooms !== target) {
        return false;
      }
    }
    if (apt.price < filters.minPrice || apt.price > filters.maxPrice) {
      return false;
    }
    return true;
  });

  return (
    <div className="mx-auto mt-6 flex w-full max-w-screen-2xl flex-col overflow-hidden rounded-[20px] border border-border bg-card shadow-sm lg:flex-row">
      {/* Sidebar */}
      <FilterSidebar filters={filters} setFilters={setFilters} reset={reset} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-8 p-6 md:p-10">
        <div>
          <h1 className="text-[28px] text-foreground mb-1">
            Available for rent in{" "}
            <span className="font-bold">Costa Rica, San José</span>
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              {filteredApartments.length} units available
            </p>
            <div className="flex items-center text-sm font-medium">
              <span className="text-muted-foreground mr-2 flex items-center gap-1">
                <ArrowDownWideNarrow
                  aria-hidden="true"
                  data-testid="guest-dashboard-sort-icon"
                  className="h-4 w-4"
                />
                Sort by:
              </span>
              <span className="text-primary cursor-pointer flex items-center gap-1">
                Relevance
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L5 5L9 1"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <BedroomTabs
          selected={filters.bedrooms}
          onSelect={(bedrooms) => setFilters({ bedrooms })}
        />

        <ApartmentGrid
          apartments={filteredApartments}
          onApartmentClick={handleApartmentClick}
        />

        <div className="mt-6">
          <GuestBookingsSummary />
        </div>
      </main>
    </div>
  );
}
