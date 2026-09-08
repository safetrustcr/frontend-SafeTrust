"use client";

import type { HotelListing } from "@/@types/hotel";
import { ApartmentGrid, BedroomTabs, FilterSidebar, HotelHeader } from "@/components/hotel";
import { STUB_HOTELS } from "@/lib/mockData/hotels";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Lightbulb, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type SortOption = "relevance" | "price-low" | "price-high";

export default function HotelListingPage() {
  const router = useRouter();
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

      return matchesCategory && matchesLocation && matchesBedroom && matchesPrice;
    });

    if (sortOption === "price-low") {
      return [...apartments].sort((left, right) => left.price - right.price);
    }

    if (sortOption === "price-high") {
      return [...apartments].sort((left, right) => right.price - left.price);
    }

    return [...apartments].sort(
      (left, right) => Number(right.promoted) - Number(left.promoted),
    );
  }, [maxPrice, minPrice, selectedBedrooms, selectedCategories, selectedLocations, sortOption]);

  const toggleValue = (values: string[], value: string) =>
    values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

  const handleApartmentClick = (apartment: HotelListing) => {
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
                Available for rent in{' '}
                <span className="font-semibold">Costa Rica, San José</span>
              </h1>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">204 units available</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/guest/suggestions"
                className="flex items-center gap-1.5 text-sm font-medium text-orange-500 transition-colors hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <Lightbulb aria-hidden="true" className="h-4 w-4" />
                Suggestions view
              </Link>
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 text-sm
                                   border border-gray-200 dark:border-slate-700
                                   rounded-lg px-3 py-2 hover:bg-gray-50
                                   dark:hover:bg-slate-800 transition-colors
                                   text-gray-700 dark:text-gray-300">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Sort & Filter</span>
                  <span className="text-orange-500 font-medium">
                    {(sortOption !== "relevance" ||
                      minPrice !== 3200 ||
                      maxPrice !== 206000 ||
                      selectedBedrooms !== "all" ||
                      selectedCategories.length !== 2 ||
                      !selectedCategories.includes("Family") ||
                      !selectedCategories.includes("Students")) ? "•" : ""}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-72 p-4 space-y-4 max-h-[85vh] overflow-y-auto
                           bg-white dark:bg-slate-800
                           border border-gray-200 dark:border-slate-700"
              >
                {/* Sort by */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide
                                text-gray-500 dark:text-gray-400">
                    Sort by
                  </p>
                  {[
                    { label: "Relevance", value: "relevance" },
                    { label: "Price: Low to High", value: "price-low" },
                    { label: "Price: High to Low", value: "price-high" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortOption(opt.value as SortOption)}
                      className={cn(
                        "w-full text-left text-sm px-3 py-2 rounded-lg transition-colors",
                        sortOption === opt.value
                          ? "bg-orange-500 text-white"
                          : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <hr className="border-gray-100 dark:border-slate-700" />

                {/* Category */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide
                                text-gray-500 dark:text-gray-400">
                    Category
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategories([])}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full transition-colors border",
                        selectedCategories.length === 0
                          ? "bg-orange-500 border-orange-500 text-white"
                          : "border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300"
                      )}
                    >
                      All
                    </button>
                    {["Family", "Students", "Travelers"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategories((prev) => toggleValue(prev, cat))}
                        className={cn(
                          "text-xs px-3 py-1.5 rounded-full transition-colors border",
                          selectedCategories.includes(cat)
                            ? "bg-orange-500 border-orange-500 text-white"
                            : "border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="border-gray-100 dark:border-slate-700" />

                {/* Bedrooms */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide
                                text-gray-500 dark:text-gray-400">
                    Bedrooms
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "All", value: "all" },
                      { label: "1 bedroom", value: "1" },
                      { label: "2 bedrooms", value: "2" },
                      { label: "3 bedrooms", value: "3" },
                    ].map((bd) => (
                      <button
                        key={bd.value}
                        onClick={() => setSelectedBedrooms(bd.value)}
                        className={cn(
                          "text-xs px-3 py-1.5 rounded-full transition-colors border",
                          selectedBedrooms === bd.value
                            ? "bg-orange-500 border-orange-500 text-white"
                            : "border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300"
                        )}
                      >
                        {bd.label}
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="border-gray-100 dark:border-slate-700" />

                {/* Price range */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide
                                text-gray-500 dark:text-gray-400">
                    Price Range
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-200
                                 dark:border-slate-600 bg-white dark:bg-slate-900
                                 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300"
                    />
                    <span className="text-gray-400">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-200
                                 dark:border-slate-600 bg-white dark:bg-slate-900
                                 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300"
                    />
                  </div>
                  <button
                    className="w-full mt-2 bg-gray-900 dark:bg-slate-700 text-white
                               hover:bg-gray-800 dark:hover:bg-slate-600
                               text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </div>

                <hr className="border-gray-100 dark:border-slate-700" />

                {/* Reset */}
                <button
                  onClick={() => {
                    setSortOption("relevance");
                    setSelectedCategories(["Family", "Students"]);
                    setSelectedBedrooms("all");
                    setMinPrice(3200);
                    setMaxPrice(206000);
                  }}
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
            <BedroomTabs selected={selectedBedrooms} onSelect={setSelectedBedrooms} />
          </div>

          <div className="mt-8">
            <ApartmentGrid apartments={filteredApartments} onApartmentClick={handleApartmentClick} />
          </div>
        </main>
      </div>
    </div>
  );
}
