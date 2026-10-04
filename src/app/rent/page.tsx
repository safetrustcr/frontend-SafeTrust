"use client";

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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LayoutDashboard, Lightbulb, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type SortOption = "relevance" | "price-low" | "price-high" | "nearest";

export default function ApartmentListingPage() {
  const router = useRouter();
  const geo = useGeolocation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Family",
    "Students",
  ]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([
    "San José",
    "Heredia",
  ]);
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("relevance");
  const [minPrice, setMinPrice] = useState<number>(3200);
  const [maxPrice, setMaxPrice] = useState<number>(206000);
  const [favorites, setFavorites] = useState<string[]>(
    APARTMENT_LISTINGS.filter((h) => h.favorite).map((h) => h.id),
  );

  const toggleFavorite = (id: string) => {
    setFavorites((curr) =>
      curr.includes(id) ? curr.filter((f) => f !== id) : [...curr, id],
    );
  };

  const isOutsideCostaRica = useMemo(() => {
    if (!geo.position) return false;
    const origin = geo.position;
    const nearestListingKm = Math.min(
      ...APARTMENT_LISTINGS.map((apartment) =>
        distanceKm(origin, apartment.coordinates),
      ),
    );
    return nearestListingKm > 300;
  }, [geo.position]);

  useEffect(() => {
    if (geo.position) {
      setSortOption(isOutsideCostaRica ? "relevance" : "nearest");
    } else if (geo.status === "idle") {
      setSortOption("relevance");
    }
  }, [geo.position, geo.status, isOutsideCostaRica]);

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

  const filteredApartments = useMemo(() => {
    const apartments = APARTMENT_LISTINGS.filter((apartment) => {
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

    if (sortOption === "nearest" && geo.position && !isOutsideCostaRica) {
      return sortByDistance(
        apartments,
        geo.position,
        (apartment) => apartment.coordinates,
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
    isOutsideCostaRica,
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

  const handleApartmentClick = (apartment: ApartmentListing) => {
    router.push(`/rent/${apartment.id}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
      <HotelHeader />

      <div className="mx-auto flex max-w-[1180px] flex-col lg:flex-row">
        <FilterSidebar
          selectedCategories={selectedCategories}
          selectedLocations={selectedLocations}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onCategoryToggle={(category) =>
            setSelectedCategories((current) => toggleValue(current, category))
          }
          onLocationToggle={(location) =>
            setSelectedLocations((current) => toggleValue(current, location))
          }
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
        />

        <main className="flex-1 px-6 py-8 lg:px-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-[24px] leading-tight text-gray-900 dark:text-white sm:text-[30px]">
                {geo.position && !isOutsideCostaRica ? (
                  "Destinations near you"
                ) : (
                  <>
                    Available for rent in{" "}
                    <span className="font-semibold">Costa Rica, San José</span>
                  </>
                )}
              </h1>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                204 units available
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
              <NearMeButton geo={geo} />

              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-1.5 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Switch to Host view
              </button>

              <Link
                href="/guest/suggestions"
                className="flex items-center gap-1.5 text-sm font-medium text-orange-500 transition-colors hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <Lightbulb aria-hidden="true" className="h-4 w-4" />
                Suggestions view
              </Link>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-md px-2 py-1"
                    aria-label="Sort options"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Sort by:{" "}
                    <span className="font-semibold capitalize">
                      {sortOption}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setSortOption("relevance")}
                      className={cn(
                        "text-left px-3 py-2 text-sm rounded-md transition-colors",
                        sortOption === "relevance"
                          ? "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 font-semibold"
                          : "hover:bg-gray-100 dark:hover:bg-slate-800",
                      )}
                    >
                      Relevance
                    </button>
                    <button
                      onClick={() => setSortOption("nearest")}
                      className={cn(
                        "text-left px-3 py-2 text-sm rounded-md transition-colors",
                        sortOption === "nearest"
                          ? "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 font-semibold"
                          : "hover:bg-gray-100 dark:hover:bg-slate-800",
                      )}
                    >
                      Nearest
                    </button>
                    <button
                      onClick={() => setSortOption("price-low")}
                      className={cn(
                        "text-left px-3 py-2 text-sm rounded-md transition-colors",
                        sortOption === "price-low"
                          ? "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 font-semibold"
                          : "hover:bg-gray-100 dark:hover:bg-slate-800",
                      )}
                    >
                      Price: Low to High
                    </button>
                    <button
                      onClick={() => setSortOption("price-high")}
                      className={cn(
                        "text-left px-3 py-2 text-sm rounded-md transition-colors",
                        sortOption === "price-high"
                          ? "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 font-semibold"
                          : "hover:bg-gray-100 dark:hover:bg-slate-800",
                      )}
                    >
                      Price: High to Low
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="mt-8">
            <BedroomTabs
              selected={selectedBedrooms}
              onSelect={setSelectedBedrooms}
            />
          </div>

          <div className="mt-8">
            <ApartmentGrid
              apartments={filteredApartments}
              distances={distances}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onApartmentClick={handleApartmentClick}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
