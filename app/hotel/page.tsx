'use client';

import type { HotelListing } from '@/@types/hotel';
import {
  ApartmentGrid,
  BedroomTabs,
  FilterSidebar,
  HotelHeader,
} from '@/components/hotel';
import { STUB_HOTELS } from '@/mockData/hotels';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { BsSortDownAlt } from 'react-icons/bs';

type SortOption = 'relevance' | 'price-low' | 'price-high';

export default function HotelListingPage() {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Family',
    'Students',
  ]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([
    'San José',
    'Heredia',
  ]);
  const [selectedBedrooms, setSelectedBedrooms] = useState('all');
  const [sortOption] = useState<SortOption>('relevance');
  const [minPrice, setMinPrice] = useState(3200);
  const [maxPrice, setMaxPrice] = useState(206000);

  const filteredApartments = useMemo(() => {
    const apartments = STUB_HOTELS.filter((apartment) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(apartment.category);
      const matchesLocation =
        selectedLocations.length === 0 ||
        selectedLocations.includes(apartment.location);
      const matchesBedroom =
        selectedBedrooms === 'all' ||
        apartment.bedrooms === Number(selectedBedrooms);
      const matchesPrice =
        apartment.price >= minPrice && apartment.price <= maxPrice;

      return (
        matchesCategory && matchesLocation && matchesBedroom && matchesPrice
      );
    });

    if (sortOption === 'price-low') {
      return [...apartments].sort((left, right) => left.price - right.price);
    }

    if (sortOption === 'price-high') {
      return [...apartments].sort((left, right) => right.price - left.price);
    }

    return [...apartments].sort(
      (left, right) => Number(right.promoted) - Number(left.promoted)
    );
  }, [
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

  const handleApartmentClick = (apartment: HotelListing) => {
    router.push(`/hotel/${apartment.id}`);
  };

  return (
    <div className="min-h-screen bg-white text-[#1c1c1c]">
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
              <h1 className="text-[24px] leading-tight text-[#1d1d1d] sm:text-[30px]">
                Available for rent in{' '}
                <span className="font-semibold">Costa Rica, San José</span>
              </h1>
              <p className="mt-3 text-sm text-[#515151]">204 units available</p>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#202020]">
              <BsSortDownAlt className="h-4 w-4" />
              <span>Sort by:</span>
              <span className="font-semibold text-[#ff6a00]">Relevance</span>
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
              onApartmentClick={handleApartmentClick}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
