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
import RentFiltersPanel from "@/components/listings/RentFiltersPanel";
import { useGeolocation } from "@/hooks/useGeolocation";
import { distanceKm, sortByDistance } from "@/lib/geo";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SlidersHorizontal } from "lucide-react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";
import { DEFAULT_MAX_PRICE, DEFAULT_MIN_PRICE } from "@/lib/rent-filters";

type SortOption = "relevance" | "price-low" | "price-high" | "nearest";

const normalizeSearchText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase();

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Relevance", value: "relevance" },
  { label: "Nearest", value: "nearest" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
];

function SortControl({
  sortOption,
  onChange,
}: {
  sortOption: SortOption;
  onChange: (option: SortOption) => void;
}) {
  const selectedLabel =
    SORT_OPTIONS.find((option) => option.value === sortOption)?.label ??
    SORT_OPTIONS[0].label;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-foreground hover:text-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          aria-label="Sort options"
        >
          <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
          Sort by: <span className="font-semibold">{selectedLabel}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-52 p-2">
        <div className="flex flex-col gap-1">
          {SORT_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              aria-pressed={sortOption === value}
              className={cn(
                "rounded-md px-3 py-2 text-left text-sm transition-colors",
                sortOption === value
                  ? "bg-orange-50 font-semibold text-orange-600 dark:bg-orange-950/40 dark:text-orange-400"
                  : "hover:bg-gray-100 dark:hover:bg-slate-800",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ApartmentListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const normalizedQuery = normalizeSearchText(query);
  const geo = useGeolocation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedBedrooms, setSelectedBedrooms] = useState("all");
  const [sortOption, setSortOption] = useState<SortOption>("relevance");
  const [minPrice, setMinPrice] = useState<number>(DEFAULT_MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState<number>(DEFAULT_MAX_PRICE);
  const [favorites, setFavorites] = useState<string[]>(
    APARTMENT_LISTINGS.filter((h) => h.favorite).map((h) => h.id),
  );

  const toggleFavorite = (id: string) => {
    setFavorites((curr) =>
      curr.includes(id) ? curr.filter((f) => f !== id) : [...curr, id],
    );
  };

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

  useEffect(() => {
    if (geo.position) {
      setSortOption(isOutsideCostaRica ? "relevance" : "nearest");
    } else {
      setSortOption((current) =>
        current === "nearest" ? "relevance" : current,
      );
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
        (selectedBedrooms === "3"
          ? apartment.bedrooms >= 3
          : apartment.bedrooms === Number(selectedBedrooms));
      const matchesPrice =
        apartment.price >= minPrice && apartment.price <= maxPrice;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        normalizeSearchText(`${apartment.name} ${apartment.address}`).includes(
          normalizedQuery,
        );

      return (
        matchesCategory &&
        matchesLocation &&
        matchesBedroom &&
        matchesPrice &&
        matchesQuery
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
    normalizedQuery,
    selectedBedrooms,
    selectedCategories,
    selectedLocations,
    sortOption,
  ]);

  /** Toggle one string-valued filter selection. */
  const toggleValue = (values: string[], value: string) =>
    values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values, value];

  const filterProps = {
    selectedCategories,
    selectedLocations,
    selectedBedrooms,
    minPrice,
    maxPrice,
    onCategoryToggle: (category: string) =>
      setSelectedCategories((current) => toggleValue(current, category)),
    onLocationToggle: (location: string) =>
      setSelectedLocations((current) => toggleValue(current, location)),
    onBedroomChange: setSelectedBedrooms,
    onMinPriceChange: setMinPrice,
    onMaxPriceChange: setMaxPrice,
  };
  const activeFilterCount =
    selectedCategories.length +
    selectedLocations.length +
    Number(selectedBedrooms !== "all") +
    Number(minPrice !== DEFAULT_MIN_PRICE || maxPrice !== DEFAULT_MAX_PRICE);

  const handleApartmentClick = (apartment: ApartmentListing) => {
    router.push(`/rent/${apartment.id}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HotelHeader />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sticky top-20 z-20 -mx-4 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-2 backdrop-blur lg:hidden">
          <Drawer.Root shouldScaleBackground={false}>
            <Drawer.Trigger asChild>
              <button
                type="button"
                className="inline-flex min-h-10 shrink-0 items-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted"
              >
                <SlidersHorizontal
                  aria-hidden="true"
                  className="mr-2 h-4 w-4"
                />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs text-white">
                    {activeFilterCount}
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
                <div className="min-h-0 flex-1 overflow-y-auto pb-4">
                  <RentFiltersPanel {...filterProps} />
                </div>
                <div className="sticky bottom-0 flex shrink-0 justify-end border-t border-border bg-background py-3">
                  <SortControl
                    sortOption={sortOption}
                    onChange={setSortOption}
                  />
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
          <span className="text-sm text-muted-foreground">
            {filteredApartments.length} units
          </span>
        </div>

        <div className="flex flex-col gap-6 py-6 lg:flex-row lg:gap-8">
          <aside className="hidden w-72 shrink-0 lg:block">
            <FilterSidebar
              selectedCategories={selectedCategories}
              selectedLocations={selectedLocations}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onCategoryToggle={filterProps.onCategoryToggle}
              onLocationToggle={filterProps.onLocationToggle}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
            />
          </aside>

          <main className="min-w-0 flex-1">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Available rentals
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {filteredApartments.length} units available in Costa Rica
                </p>
              </div>
              <div className="flex flex-wrap items-start gap-4">
                <NearMeButton geo={geo} />
                <div className="hidden lg:block">
                  <SortControl
                    sortOption={sortOption}
                    onChange={setSortOption}
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <BedroomTabs
                selected={selectedBedrooms}
                onSelect={filterProps.onBedroomChange}
              />
            </div>

            <ApartmentGrid
              apartments={filteredApartments}
              distances={distances}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onApartmentClick={handleApartmentClick}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ApartmentListingPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen bg-background"
          aria-busy="true"
          aria-label="Loading rentals"
        />
      }
    >
      <ApartmentListingContent />
    </Suspense>
  );
}
