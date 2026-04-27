'use client';

import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatListingPrice } from './formatListingPrice';

export interface SuggestionCardProps {
  id: string;
  name: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  petFriendly: boolean;
  image?: string;
  isLiked?: boolean;
  onLike?: (id: string) => void;
  onClick?: (id: string) => void;
}

export default function SuggestionCard({
  id,
  name,
  address,
  price,
  bedrooms,
  bathrooms,
  petFriendly,
  image,
  isLiked = false,
  onLike,
  onClick,
}: SuggestionCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(isLiked);

  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  const handleCardClick = () => {
    if (onClick) {
      onClick(id);
      return;
    }

    router.push(`/hotel/${id}`);
  };

  const handleLikeClick = () => {
    setLiked((currentLiked) => !currentLiked);
    onLike?.(id);
  };

  return (
    <div
      className={cn(
        'group w-full rounded-[12px] border border-[#dfd9d2] bg-white p-3 shadow-sm transition',
        'hover:border-[#cfc6bc] hover:shadow-md'
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={handleCardClick}
          aria-label={`View ${name}`}
          className="flex min-w-0 flex-1 items-start gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10a156]/30"
        >
          <div className="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-[10px] bg-muted">
            <Image
              src={image ?? '/img/hotel/hotel1.jpg'}
              alt={name}
              fill
              sizes="60px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="min-w-0">
              <h3 className="text-base font-medium leading-5 text-foreground">
                {name}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
                {address}
              </p>
            </div>

            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {bedrooms}bd · {petFriendly ? 'pet friendly' : 'no pets'} ·{' '}
                {bathrooms} ba
              </p>
              <span className="text-right text-[1.75rem] font-semibold leading-none text-green-600">
                {formatListingPrice(price)}
              </span>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={handleLikeClick}
          aria-pressed={liked}
          aria-label={liked ? `Unlike ${name}` : `Like ${name}`}
          className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
        >
          <Heart
            aria-hidden="true"
            className={cn(
              'h-5 w-5 transition-colors',
              liked ? 'fill-red-500 text-red-500' : 'text-red-500'
            )}
          />
        </button>
      </div>
    </div>
  );
}
