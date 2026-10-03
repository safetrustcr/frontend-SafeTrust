"use client";

import type { HotelListing } from "@/@types/hotel";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DestinationCard from "./DestinationCard";

const ITEMS_PER_PAGE = 4;

interface DestinationCarouselProps {
  destinations: HotelListing[];
  onDestinationClick?: (destination: HotelListing) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export default function DestinationCarousel({
  destinations,
  onDestinationClick,
  autoPlay = false,
  autoPlayInterval = 5000,
}: DestinationCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.max(
    Math.ceil(destinations.length / ITEMS_PER_PAGE),
    1,
  );

  // Keep the current page in range when the destination list changes (e.g. filters)
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const handleDestinationClick = (destination: HotelListing) => {
    onDestinationClick?.(destination);
  };

  const startIndex = currentPage * ITEMS_PER_PAGE;
  const visibleDestinations = destinations.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || totalPages <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, totalPages]);

  if (destinations.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-100 dark:bg-slate-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">
          No destinations available
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleDestinations.map((destination, index) => (
          <DestinationCard
            key={destination.id}
            destination={destination}
            loading={index === 0 ? "eager" : "lazy"}
            onClick={() => handleDestinationClick(destination)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 0}
            className="p-2 rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous destinations"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentPage === index
                    ? "bg-orange-500"
                    : "bg-gray-300 dark:bg-slate-600"
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages - 1}
            className="p-2 rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next destinations"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
