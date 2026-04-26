"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface ImageGalleryProps {
  images: string[];
  promoted?: boolean;
  altText?: string;
}

/** Up to 3 indices for the right column: current hero first (for highlight), then others in gallery order. */
function thumbIndices(activeIndex: number, length: number): number[] {
  if (length <= 0) return [];
  const ordered: number[] = [];
  const push = (i: number) => {
    if (i < 0 || i >= length) return;
    if (!ordered.includes(i)) ordered.push(i);
  };
  push(activeIndex);
  for (let i = 0; i < length; i++) push(i);
  return ordered.slice(0, Math.min(3, length));
}

export default function ImageGallery({
  images,
  promoted = false,
  altText = "Apartment",
}: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const safeLen = images.length;
  const heroIndex = safeLen === 0 ? 0 : Math.min(Math.max(0, activeIndex), safeLen - 1);
  const heroSrc = images[heroIndex];
  const thumbs = useMemo(() => thumbIndices(heroIndex, safeLen), [heroIndex, safeLen]);

  useEffect(() => {
    if (safeLen === 0) return;
    setActiveIndex((i) => Math.max(0, Math.min(i, safeLen - 1)));
  }, [safeLen]);

  if (safeLen === 0) {
    return null;
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-4 md:flex-row md:items-stretch md:gap-4">
      {/* Hero — 2/3 on md+ */}
      <div className="relative min-h-[220px] w-full min-w-0 overflow-hidden rounded-lg md:w-2/3 md:flex-[2] md:min-h-[320px] lg:min-h-[360px]">
        <Image
          src={heroSrc}
          alt={`${altText} — main photo (${heroIndex + 1} of ${safeLen})`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 66vw"
          priority
        />
        {promoted ? (
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded bg-orange-500 px-2 py-1 text-xs font-bold text-white">
            🏷️ PROMOTED
          </span>
        ) : null}
      </div>

      {/* Thumbnails — 1/3 on md+, stacked; mobile: full width, stacked under hero */}
      {safeLen > 1 ? (
        <div
          className="flex w-full flex-shrink-0 flex-col gap-2 md:w-1/3 md:flex-[1]"
          role="list"
          aria-label="Gallery thumbnails"
        >
          {thumbs.map((imageIndex) => {
            const src = images[imageIndex]!;
            const isActive = imageIndex === heroIndex;
            return (
              <button
                key={`${imageIndex}-${src}`}
                type="button"
                role="listitem"
                aria-label={`Show photo ${imageIndex + 1} of ${safeLen}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => setActiveIndex(imageIndex)}
                className={cn(
                  "relative aspect-[4/3] w-full min-h-[88px] shrink-0 overflow-hidden rounded-lg border-2 border-transparent outline-none transition-shadow md:min-h-[96px] lg:min-h-[108px]",
                  isActive
                    ? "ring-2 ring-orange-500 ring-offset-2 ring-offset-background"
                    : "hover:opacity-90 focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2",
                )}
              >
                <Image
                  src={src}
                  alt={`${altText} — photo ${imageIndex + 1} of ${safeLen}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 34vw"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
