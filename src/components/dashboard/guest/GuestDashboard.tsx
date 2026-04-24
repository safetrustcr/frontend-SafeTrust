"use client";

import type { HotelListing } from "@/@types/hotel";
import ApartmentGrid from "@/components/hotel/ApartmentGrid";
import BedroomTabs from "@/components/hotel/BedroomTabs";
import FilterSidebar from "@/components/hotel/FilterSidebar";
import { useState } from "react";
import { BsSortDownAlt } from "react-icons/bs";
import GuestBookingsSummary from "./GuestBookingsSummary";
import { useRouter } from "next/navigation";

// TODO: replace with useQuery(GET_APARTMENTS) — GraphQL wiring issue
const STUB_APARTMENTS: HotelListing[] = [
  {
    id: "1",
    name: "La sabana sur",
    address: "329 Calle santos, paseo colón, San José",
    price: 4058,
    bedrooms: 2,
    bathrooms: 1,
    petFriendly: true,
    promoted: true,
    location: "San José",
    category: "Family",
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    owner: { name: "Randall Valenciano", avatar: "/avatar.png" },
    description: "Beautiful apartment in La Sabana.",
    favorite: false,
  },
  {
    id: "2",
    name: "Heredia Centro",
    address: "Avenida Central, Heredia",
    price: 3200,
    bedrooms: 1,
    bathrooms: 1,
    petFriendly: false,
    promoted: false,
    location: "Heredia",
    category: "Students",
    images: ["https://images.unsplash.com/photo-1502672260266-1c1de2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    owner: { name: "Randall Valenciano", avatar: "/avatar.png" },
    description: "Cozy studio near the university.",
    favorite: true,
  },
  {
    id: "3",
    name: "Escazú Village",
    address: "Escazú, San José",
    price: 5100,
    bedrooms: 3,
    bathrooms: 2,
    petFriendly: true,
    promoted: true,
    location: "San José",
    category: "Family",
    images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    owner: { name: "Randall Valenciano", avatar: "/avatar.png" },
    description: "Luxury apartment in the heart of Escazú.",
    favorite: true,
  },
  {
    id: "4",
    name: "Alajuela Downtown",
    address: "Calle 2, Alajuela",
    price: 2800,
    bedrooms: 2,
    bathrooms: 1,
    petFriendly: true,
    promoted: false,
    location: "Alajuela",
    category: "Travelers",
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    owner: { name: "Randall Valenciano", avatar: "/avatar.png" },
    description: "Conveniently located near the airport.",
    favorite: false,
  },
  {
    id: "5",
    name: "Rohrmoser Studio",
    address: "Rohrmoser, San José",
    price: 3500,
    bedrooms: 1,
    bathrooms: 1,
    petFriendly: false,
    promoted: false,
    location: "San José",
    category: "Students",
    images: ["https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    owner: { name: "Randall Valenciano", avatar: "/avatar.png" },
    description: "Modern studio in Rohrmoser.",
    favorite: false,
  },
  {
    id: "6",
    name: "Cariari Mansion",
    address: "Cariari, Heredia",
    price: 8000,
    bedrooms: 4,
    bathrooms: 3,
    petFriendly: true,
    promoted: true,
    location: "Heredia",
    category: "Family",
    images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    owner: { name: "Randall Valenciano", avatar: "/avatar.png" },
    description: "Spacious mansion in Cariari.",
    favorite: true,
  },
];

export default function GuestDashboard() {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<number>(3200);
  const [maxPrice, setMaxPrice] = useState<number>(206000);

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
    router.push(`/hotel/${apartment.id}`);
  };

  // Derived filtered state
  const filteredApartments = STUB_APARTMENTS.filter((apt) => {
    // Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(apt.category)) {
      return false;
    }
    // Location filter
    if (selectedLocations.length > 0 && !selectedLocations.includes(apt.location)) {
      return false;
    }
    // Bedroom filter
    if (selectedBedrooms !== "all") {
      if (selectedBedrooms === "1" && apt.bedrooms !== 1) return false;
      if (selectedBedrooms === "2" && apt.bedrooms !== 2) return false;
      if (selectedBedrooms === "3" && apt.bedrooms !== 3) return false;
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
