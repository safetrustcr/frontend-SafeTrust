"use client";

import type { HotelListing } from "@/@types/hotel";
import {
  ApartmentGrid,
  BedroomTabs,
  DestinationCard,
  FilterSidebar,
  HotelHeader,
} from "@/components/listings";
import { NearMeButton } from "@/components/listings/NearMeButton";
import { useGeolocation } from "@/hooks/useGeolocation";
import { distanceKm, sortByDistance } from "@/lib/geo";
import { STUB_HOTELS } from "@/lib/mockData/hotels";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LayoutDashboard, Lightbulb, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

type SortOption = "relevance" | "price-low" | "price-high" | "nearest";

const DESTINATIONS = [
  { name: "San José", image: "/img/hotel/hotel1.jpg" },
  { name: "Heredia", image: "/img/hotel/hotel2.jpg" },
  { name: "Alajuela", image: "/img/hotel/hotel3.jpg" },
  { name: "Cartago", image: "/img/hotel/hotel4.jpg" },
];

function RentListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const geo = useGeolocation();

  const urlLocation = searchParams.get("location");
  const urlCategory = searchParams.get("category");

  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    if (urlCategory) return [urlCategory];
    return [];
  });

  const [selectedLocations, setSelectedLocations] = useState<string[]>(() => {
    if (urlLocation) return [urlLocation];
    return [];
  });

  const [selectedBedrooms, setSelectedBedrooms] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("relevance");
  const [minPrice, setMinPrice] = useState<number>(3200);
  const [maxPrice, setMaxPrice] = useState<number>(206000);

  useEffect(() => {
    setSelectedLocations((prev) =>
      urlLocation ? [urlLocation] : prev.length === 1 ? [] : prev,
    );
  }, [urlLocation]);

  useEffect(() => {
    setSelectedCategories((prev) =>
      urlCategory ? [urlCategory] : prev.length === 1 ? [] : prev,
    );
  }, [urlCategory]);

  useEffect(() => {
    if (geo.status === "granted" && geo.position) {
      setSortOption("nearest");
    }
  }, [geo.status, geo.position]);

  const updateUrlParams = (locations: string[], categories: string[]) => {
    const params = new URLSearchParams();
    if (locations.length === 1) {
      params.set("location", locations[0]);
    }
    if (categories.length === 1) {
      params.set("category", categories[0]);
    }
    const query = params.toString();
    router.replace(query ? `/rent?${query}` : "/rent", { scroll: false });
  };

  const distances = useMemo(() => {
    if (!geo.position) return undefined;
    const result: Record<string, number> = {};
    for (const apt of STUB_HOTELS) {
      if (apt.coordinates) {
        result[apt.id] = distanceKm(geo.position, apt.coordinates);
      }
    }
    return result;
  }, [geo.position]);

  const filteredApartments = useMemo(() => {
    const apartments = STUB_HOTELS.filter((apartment) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(apartment.category);
      const matchesLocation =
        selectedLocations.length === 0 ||
        selectedLocations.includes(apartment.location);
      const matchesBedroom =
        selectedBedrooms === "all" ||
        apartment.bedrooms === Number(selectedBedrooms);
      const matchesPrice =
        apartment.price >= minPrice && apartment.price <= maxPrice;

      return (
        matchesCategory && matchesLocation && matchesBedroom && matchesPrice
      );
    });

    if (sortOption === "nearest" && geo.position) {
      return sortByDistance(
        apartments,
        geo.position,
        (apartment) => apartment.coordinates ?? { lat: 9.9333, lng: -84.0833 },
      );
    }

    if (sortOption === "price-low") {
      return [...apartments].sort((left, right) => left.price - right.price);
    }

    if (sortOption === "price-high") {
      return [...apartments].sort((left, right) => right.price - left.price);
    }

    return [...apartments].sort(
      (left, right) => Number(right.promoted) - Number(left.promoted),
    );
  }, [
    geo.position,
    maxPrice,
    minPrice,
    selectedBedrooms,
    selectedCategories,
    selectedLocations,
    sortOption,
  ]);

  const toggleValue = (values: string[], value: string) =>
    values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values, value];

  const handleLocationToggle = (location: string) => {
    const next = toggleValue(selectedLocations, location);
    setSelectedLocations(next);
    updateUrlParams(next, selectedCategories);
  };

  const handleCategoryToggle = (category: string) => {
    const next = toggleValue(selectedCategories, category);
    setSelectedCategories(next);
    updateUrlParams(selectedLocations, next);
  };

  const handleDestinationSelect = (location: string) => {
    const next = [location];
    setSelectedLocations(next);
    updateUrlParams(next, selectedCategories);
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedLocations([]);
    setSelectedBedrooms("all");
    setSortOption("relevance");
    setMinPrice(3200);
    setMaxPrice(206000);
    if (geo.status === "granted") {
      geo.clear();
    }
    router.replace("/rent", { scroll: false });
  };

  const handleApartmentClick = (apartment: HotelListing) => {
    router.push(`/rent/${apartment.id}`);
  };

  const headingLocation =
    selectedLocations.length === 1
      ? `Costa Rica, ${selectedLocations[0]}`
      : "Costa Rica, San José";

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
      <HotelHeader />

      <div className="mx-auto flex max-w-[1180px] flex-col lg:flex-row">
        <FilterSidebar
          selectedCategories={selectedCategories}
          selectedLocations={selectedLocations}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onCategoryToggle={handleCategoryToggle}
          onLocationToggle={handleLocationToggle}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
        />

        <main className="flex-1 px-6 py-8 lg:px-12">
          {/* Destination Quick Selector */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
              Popular Destinations
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {DESTINATIONS.map((dest) => (
                <DestinationCard
                  key={dest.name}
                  name={dest.name}
                  image={dest.image}
                  selected={
                    selectedLocations.length === 1 &&
                    selectedLocations[0] === dest.name
                  }
                  onClick={() => handleDestinationSelect(dest.name)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-[24px] leading-tight text-gray-900 dark:text-white sm:text-[30px]">
                {geo.position && sortOption === "nearest" ? (
                  "Destinations near you"
                ) : (
                  <>
                    Available for rent in{" "}
                    <span className="font-semibold">{headingLocation}</span>
                  </>
                )}
              </h1>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                {filteredApartments.length} units available
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <NearMeButton geo={geo} />

              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Switch to Host view
              </button>

              <Link
                href="/guest/suggestions"
                className="flex items-center gap-1.5 text-sm font-medium text-orange-600 transition-colors hover:text-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <Lightbulb aria-hidden="true" className="h-4 w-4" />
                Suggestions view
              </Link>

              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-3.5 w-3.5" />
                Clear all
              </button>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="flex items-center gap-2 text-sm
                                     border border-gray-200 dark:border-slate-700
                                     rounded-lg px-3 py-2 hover:bg-gray-50
                                     dark:hover:bg-slate-800 transition-colors
                                     text-gray-700 dark:text-gray-300"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Sort & Filter</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-72 p-4 space-y-4 max-h-[85vh] overflow-y-auto
                             bg-white dark:bg-slate-800
                             border border-gray-200 dark:border-slate-700"
                >
                  {/* Category Chips inside Popover */}
                  <div className="space-y-2">
                    <p
                      className="text-xs font-semibold uppercase tracking-wide
                                  text-gray-500 dark:text-gray-400"
                    >
                      Category
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["Family", "Students", "Travelers"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleCategoryToggle(cat)}
                          className={cn(
                            "text-xs px-3 py-1.5 rounded-full transition-colors border",
                            selectedCategories.includes(cat)
                              ? "bg-orange-500 border-orange-500 text-white"
                              : "border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300",
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <hr className="border-gray-100 dark:border-slate-700" />

                  {/* Reset */}
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="w-full text-sm text-center text-orange-500
                               hover:text-orange-600 font-medium"
                  >
                    Reset filters
                  </button>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="mt-6">
            <BedroomTabs
              selected={selectedBedrooms}
              onSelect={setSelectedBedrooms}
            />
          </div>

          <div className="mt-8">
            <ApartmentGrid
              apartments={filteredApartments}
              distances={distances}
              onApartmentClick={handleApartmentClick}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function HotelListingPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-white dark:bg-slate-900" />}
    >
      <RentListingContent />
    </Suspense>
  );
}
