'use client';

import type { HotelListing } from '@/@types/hotel';
import { useEffect, useState } from 'react';
import SuggestionCard from './SuggestionCard';

interface SuggestionsListProps {
  apartments: HotelListing[];
  onSelect?: (id: string) => void;
}

export default function SuggestionsList({
  apartments,
  onSelect,
}: SuggestionsListProps) {
  const [likedById, setLikedById] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLikedById(
      Object.fromEntries(
        apartments.map((apartment) => [
          apartment.id,
          apartment.favorite ?? false,
        ])
      )
    );
  }, [apartments]);

  const handleLike = (id: string) => {
    setLikedById((currentLikes) => ({
      ...currentLikes,
      [id]: !currentLikes[id],
    }));
  };

  return (
    <aside className="w-full border-b border-[#e8e1da] px-6 py-8 lg:w-[320px] lg:border-b-0 lg:border-r">
      <div className="mb-6">
        <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[#181818]">
          Suggestions
        </h2>
        <p className="mt-4 text-sm text-[#202020]">
          More than 200 units available
        </p>
      </div>

      <div className="space-y-4">
        {apartments.slice(0, 5).map((apartment) => (
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
            isLiked={likedById[apartment.id] ?? apartment.favorite ?? false}
            onLike={handleLike}
            onClick={onSelect}
          />
        ))}
      </div>
    </aside>
  );
}
