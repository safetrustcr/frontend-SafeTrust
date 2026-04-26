"use client";

import type { HotelListing } from "@/@types/hotel";
import ApartmentGrid from "@/components/hotel/ApartmentGrid";
import BedroomTabs from "@/components/hotel/BedroomTabs";
import FilterSidebar from "@/components/hotel/FilterSidebar";
import { STUB_HOTELS } from "@/mockData/hotels";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BsSortDownAlt } from "react-icons/bs";
import GuestBookingsSummary from "./GuestBookingsSummary";

export default function GuestDashboard() {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>("all");
  const PRICES = STUB_HOTELS.map((a) => a.price);
  const [minPrice, setMinPrice] = useState<number>(Math.min(...PRICES));
  const [maxPrice, setMaxPrice] = useState<number>(Math.max(...PRICES));

  const onCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const onLocationToggle = (location: string) => {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location]
    );
  };

  const handleApartmentClick = (apartment: HotelListing) => {
    console.log("apartment", apartment, " was clicked");

    // router.push(`/hotel/${apartment.id}`);
  };

  // Derived filtered state
  const filteredApartments = STUB_HOTELS.filter((apt) => {
    // Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(apt.category)) {
      return false;
    }
    // Location filter
    if (selectedLocations.length > 0 && !selectedLocations.includes(apt.location)) {
      return false;
    }
    // Bedroom filter (tabs: all | 1 | 2 | 3+)
    if (selectedBedrooms !== "all") {
      const target = Number(selectedBedrooms);
      if (selectedBedrooms === "3") {
        if (apt.bedrooms < 3) return false;
      } else if (apt.bedrooms !== target) {
        return false;
      }
    }
    // Price filter
    if (apt.price < minPrice || apt.price > maxPrice) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col lg:flex-row w-full max-w-[1400px] mx-auto bg-white rounded-[20px] overflow-hidden border border-[#e8e1da] shadow-sm mt-6">
      {/* Sidebar */}
      <FilterSidebar
        selectedCategories={selectedCategories}
        selectedLocations={selectedLocations}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onCategoryToggle={onCategoryToggle}
        onLocationToggle={onLocationToggle}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-8 p-6 md:p-10">
        <div>
          <h1 className="text-[28px]  text-[#1d1d1d] mb-1">
            Available for rent in <span className="font-bold">Costa Rica, San José</span>
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-[#8a8a8a] text-sm">{filteredApartments.length} units available</p>
            <div className="flex items-center text-sm font-medium">
              <span className="text-[#8a8a8a] mr-2 flex items-center gap-1">
                <BsSortDownAlt className="h-4 w-4" />
                Sort by:
              </span>
              <span className="text-[#ff6a00] cursor-pointer flex items-center gap-1">
                Relevance
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5L9 1" stroke="#FF6A00" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <BedroomTabs
          selected={selectedBedrooms}
          onSelect={setSelectedBedrooms}
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
