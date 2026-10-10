"use client";

import { useState } from "react";
import Image from "next/image";
import VerticalCarousel from "@/components/hotels/details/VerticalCarousel";

interface GalleryProps {
  images: string[];
}

export default function Gallery({ images }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-3/4">
        <div className="relative h-80 sm:h-96 md:h-[400px] w-full overflow-hidden rounded-lg">
          <Image
            src={selectedImage}
            alt="Selected hotel photo"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 75vw"
            className="object-cover"
          />
        </div>
      </div>

      <div className="w-full md:w-1/4">
        <VerticalCarousel
          images={images}
          onSelect={setSelectedImage}
          selectedImage={selectedImage}
        />
      </div>
    </div>
  );
}
