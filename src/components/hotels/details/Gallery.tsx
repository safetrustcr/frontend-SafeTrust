"use client";

import { useState } from "react";
import Image from "@/components/ui/image";
import VerticalCarousel from "@/components/hotels/details/VerticalCarousel";

interface GalleryProps {
  images: string[];
}

export default function Gallery({ images }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="flex flex-col md:flex-row gap-4">

      <div className="w-full md:w-3/4">
        <Image src={selectedImage} alt="Selected Hotel Image" className="w-full h-auto rounded-lg" />
      </div>

      <div className="w-full md:w-1/4">
        <VerticalCarousel images={images} onSelect={setSelectedImage} selectedImage={selectedImage} />
      </div>
    </div>
  );
}
