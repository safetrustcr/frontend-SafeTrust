"use client"

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ThumbnailNavigationProps {
  images: string[];
  currentIndex: number;
  onThumbnailClick: (index: number) => void;
  className?: string;
}

export default function ThumbnailNavigation({
  images,
  currentIndex,
  onThumbnailClick,
  className = '',
}: ThumbnailNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeThumbnailRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to keep active thumbnail in view
  useEffect(() => {
    const container = containerRef.current;
    const activeThumbnail = activeThumbnailRef.current;

    if (!container || !activeThumbnail) return;

    const containerRect = container.getBoundingClientRect();
    const thumbnailRect = activeThumbnail.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    const thumbnailCenter = thumbnailRect.left + thumbnailRect.width / 2;
    const scrollOffset = thumbnailCenter - containerCenter;

    container.scrollBy({
      left: scrollOffset,
      behavior: 'smooth',
    });
  }, [currentIndex]);

  if (images.length <= 1) return null;

  return (
    <div className={cn("w-full mt-2", className)}>
      <div 
        ref={containerRef}
        className="flex space-x-2 overflow-x-auto py-2 scrollbar-hide"
        role="tablist"
        aria-label="Image thumbnails"
      >
        {images.map((src, index) => (
          <button
            key={index}
            ref={index === currentIndex ? activeThumbnailRef : null}
            onClick={() => onThumbnailClick(index)}
            className={cn(
              "relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              index === currentIndex 
                ? "border-primary scale-105" 
                : "border-transparent hover:border-gray-300 hover:scale-105"
            )}
            aria-label={`View image ${index + 1}`}
            aria-selected={index === currentIndex}
            role="tab"
            type="button"
          >
            <Image
              src={src}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 4rem, 5rem"
            />
            {index === currentIndex && (
              <div className="absolute inset-0 bg-black/20" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
