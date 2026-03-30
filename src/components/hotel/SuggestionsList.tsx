'use client';

import type { HotelListing } from '@/@types/hotel';
import Image from 'next/image';
import { AiOutlineHeart } from 'react-icons/ai';

interface SuggestionsListProps {
  apartments: HotelListing[];
  onSelect: (id: string) => void;
}

export default function SuggestionsList({
  apartments,
  onSelect,
}: SuggestionsListProps) {
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
        {apartments.map((apartment) => (
          <button
            key={apartment.id}
            type="button"
            onClick={() => onSelect(apartment.id)}
            className="flex w-full items-center gap-3 rounded-[8px] border border-[#dfd9d2] bg-white px-3 py-3 text-left transition hover:border-[#cfc6bc] hover:shadow-sm"
          >
            <div className="overflow-hidden rounded-[6px]">
              <Image
                src={apartment.images[0]}
                alt={apartment.name}
                width={78}
                height={64}
                className="h-[64px] w-[78px] object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-[#1d1d1d]">
                    {apartment.name}
                  </h3>
                  <p className="line-clamp-2 text-[11px] leading-[1.35] text-[#8a8a8a]">
                    {apartment.address}
                  </p>
                </div>
                <AiOutlineHeart className="h-5 w-5 shrink-0 text-[#ff2c2c]" />
              </div>

              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="text-[12px] text-[#6f6f6f]">
                  {apartment.bedrooms}bd ·{' '}
                  {apartment.petFriendly ? 'pet friendly' : 'no pets'} ·{' '}
                  {apartment.bathrooms} ba
                </p>
                <span className="text-[28px] font-semibold leading-none text-[#10a156]">
                  ${apartment.price.toLocaleString()}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
