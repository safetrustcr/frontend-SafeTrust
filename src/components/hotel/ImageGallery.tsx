'use client';

import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  promoted?: boolean;
}

const THUMBNAIL_SLOTS = ['thumb-1', 'thumb-2', 'thumb-3'] as const;

export default function ImageGallery({
  images,
  promoted = false,
}: ImageGalleryProps) {
  const [hero, ...thumbnails] = images;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_130px]">
      <div className="relative overflow-hidden rounded-[10px]">
        <Image
          src={hero}
          alt="Apartment main image"
          width={720}
          height={520}
          className="h-[260px] w-full object-cover sm:h-[320px] lg:h-[370px]"
        />
        {promoted ? (
          <span className="absolute bottom-6 left-0 rounded-r-[10px] bg-[#ff6a00] px-5 py-2 text-xs font-semibold uppercase tracking-[0.02em] text-white">
            Promoted
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
        {thumbnails.slice(0, 3).map((image, index) => (
          <div
            key={THUMBNAIL_SLOTS[index] ?? image}
            className="overflow-hidden rounded-[10px]"
          >
            <Image
              src={image}
              alt={`Apartment thumbnail ${index + 1}`}
              width={160}
              height={120}
              className="h-[90px] w-full object-cover lg:h-[113px]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
