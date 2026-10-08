"use client";

import type { ApartmentListing } from "@/types/hotel";
import { useEffect, useState } from "react";
import SuggestionCard from "./SuggestionCard";

interface SuggestionsListProps {
  apartments: ApartmentListing[];
  onSelect?: (id: string) => void;
}

/** Render the curated rental suggestions list. */
export default function SuggestionsList({
  apartments,
  onSelect,
}: SuggestionsListProps) {
  const [likedById, setLikedById] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLikedById((currentLikes) =>
      Object.fromEntries(
        apartments.map((apartment) => [
          apartment.id,
          currentLikes[apartment.id] ?? apartment.favorite ?? false,
        ]),
      ),
    );
  }, [apartments]);

  const handleLike = (id: string) => {
    setLikedById((currentLikes) => ({
      ...currentLikes,
      [id]: !currentLikes[id],
    }));
  };

  return (
    <aside className="w-full border-b border-border px-6 py-8 lg:w-[320px] lg:border-b-0 lg:border-r">
      <div className="mb-6">
        <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-foreground">
          Suggestions
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          More than 200 units available
        </p>
      </div>

      <div className="space-y-4">
        {apartments.slice(0, 5).map((apartment, index) => (
          <SuggestionCard
            key={apartment.id}
            id={apartment.id}
            name={apartment.name}
            address={apartment.address}
            price={apartment.price}
            bedrooms={apartment.bedrooms}
            bathrooms={apartment.bathrooms}
            petFriendly={apartment.petFriendly}
            image={apartment.images[0]}
            loading={index === 0 ? "eager" : "lazy"}
            isLiked={likedById[apartment.id] ?? apartment.favorite ?? false}
            onLike={handleLike}
            onClick={onSelect}
          />
        ))}
      </div>
    </aside>
  );
}
