import { useState } from "react";
import Image from "next/image";

interface VerticalCarouselProps {
  images: string[];
  onSelect: (src: string) => void;
  selectedImage: string;
}

export default function VerticalCarousel({
  images,
  onSelect,
  selectedImage,
}: VerticalCarouselProps) {
  const [startIndex, setStartIndex] = useState(0);
  const visibleImages = 3;
  const maxIndex = images.length - visibleImages;

  const scrollUp = () => {
    if (startIndex > 0) setStartIndex(startIndex - 1);
  };

  const scrollDown = () => {
    if (startIndex < maxIndex) setStartIndex(startIndex + 1);
  };

  return (
    <div className="relative flex flex-col h-full w-full">
      {images.length > visibleImages && (
        <button
          onClick={scrollUp}
          className="absolute -top-6 left-1/2 transform -translate-x-1/2 p-2 bg-gray-200 rounded-full hover:bg-gray-300 text-sm disabled:opacity-50"
          disabled={startIndex === 0}
        >
          ▲
        </button>
      )}

      <div className="flex flex-col gap-2 h-full">
        {images
          .slice(startIndex, startIndex + visibleImages)
          .map((img, index) => {
            const actualIndex = startIndex + index;
            return (
              <button
                key={actualIndex}
                onClick={() => onSelect(img)}
                className={`relative w-full h-[120px] rounded-lg overflow-hidden transition ${
                  selectedImage === img ? "ring-2 ring-primary" : ""
                }`}
              >
                <Image
                  src={img}
                  alt={`Hotel photo thumbnail ${actualIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover"
                />
              </button>
            );
          })}
      </div>

      {images.length > visibleImages && (
        <button
          onClick={scrollDown}
          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 p-2 bg-gray-200 rounded-full hover:bg-gray-300 text-sm disabled:opacity-50"
          disabled={startIndex >= maxIndex}
        >
          ▼
        </button>
      )}
    </div>
  );
}
