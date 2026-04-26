'use client';

import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type KeyboardEvent, type MouseEvent } from 'react';

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

const priceFormatter = new Intl.NumberFormat('de-DE', {
  maximumFractionDigits: 0,
});

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

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    handleCardClick();
  };

  const handleLikeClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setLiked((currentLiked) => !currentLiked);
    onLike?.(id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      aria-label={`View ${name}`}
      className={cn(
        'w-full rounded-[12px] border border-[#dfd9d2] bg-white p-3 text-left shadow-sm transition',
        'hover:border-[#cfc6bc] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10a156]/30'
      )}
    >
      <div className="flex items-start gap-3">
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
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-medium leading-5 text-foreground">
                {name}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
                {address}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLikeClick}
              aria-pressed={liked}
              aria-label={liked ? `Unlike ${name}` : `Like ${name}`}
              className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
            >
              <Heart
                className={cn(
                  'h-5 w-5 transition-colors',
                  liked ? 'fill-red-500 text-red-500' : 'text-red-500'
                )}
              />
            </button>
          </div>

          <div className="mt-3 flex items-end justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {bedrooms}bd · {petFriendly ? 'pet friendly' : 'no pets'} ·{' '}
              {bathrooms} ba
            </p>
            <span className="text-right text-[1.75rem] font-semibold leading-none text-green-600">
              ${priceFormatter.format(price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
