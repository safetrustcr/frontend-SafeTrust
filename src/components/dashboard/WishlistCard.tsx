"use client";

import type { Apartment } from "@/lib/mockData/apartments";

export interface WishlistCardProps {
  name: string;
  apartments: Apartment[];
  savedAt: string;
  onClick?: () => void;
}

export function WishlistCard({
  name,
  apartments,
  savedAt,
  onClick,
}: WishlistCardProps) {
  const images = apartments
    .flatMap((a) => a.image_urls ?? [])
    .filter(Boolean)
    .slice(0, 4);

  // Pad to 4 slots with placeholder gray
  while (images.length < 4) images.push("");

  return (
    <div
      onClick={onClick}
      className="cursor-pointer group rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* 2x2 image mosaic */}
      <div className="grid grid-cols-2 gap-0.5 aspect-square rounded-2xl overflow-hidden">
        {images.map((src, i) => (
          <div key={i} className="bg-muted overflow-hidden">
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="pt-3 space-y-0.5">
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{savedAt}</p>
      </div>
    </div>
  );
}
