"use client";

import { useState, useCallback } from 'react';
import ImageCarousel from './ImageCarousel';
import ThumbnailNavigation from './ThumbnailNavigation';
import FullscreenImageViewer from './FullscreenImageViewer';
import { Button } from '@/components/ui/button';
import { Maximize2 } from 'lucide-react';

interface RoomPhotosProps {
  images?: string[];
  className?: string;
}

const RoomPhotos = ({ 
  images: propImages, 
  className = '' 
}: RoomPhotosProps) => {
  // Use provided images or fallback to default
  const defaultImages = [
    "/img/room1.png?height=600&width=800",
    "/img/room1.png?height=400&width=600",
    "/img/room1.png?height=400&width=600",
    "/img/room1.png?height=400&width=600",
  ];
  
  const images = propImages || defaultImages;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleIndexChange = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const openFullscreen = useCallback(() => {
    setIsFullscreen(true);
    // Prevent body scroll when fullscreen is open
    document.body.style.overflow = 'hidden';
  }, []);

  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false);
    // Re-enable body scroll
    document.body.style.overflow = 'unset';
  }, []);

  if (!images.length) {
    return (
      <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative group">
        {/* Main image carousel */}
        <div className="relative aspect-video md:aspect-[16/9] rounded-lg overflow-hidden">
          <ImageCarousel
            images={images}
            currentIndex={currentIndex}
            onIndexChange={setCurrentIndex}
            className="w-full h-full"
            imageClassName="w-full h-full"
          />
          
          {/* Fullscreen button */}
          <Button
            onClick={openFullscreen}
            variant="ghost"
            size="icon"
            className="absolute bottom-4 right-4 bg-black/50 text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-opacity opacity-0 group-hover:opacity-100"
            aria-label="View in fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Thumbnail navigation */}
        <ThumbnailNavigation
          images={images}
          currentIndex={currentIndex}
          onThumbnailClick={handleThumbnailClick}
          className="mt-2"
        />
      </div>

      {/* Fullscreen viewer */}
      <FullscreenImageViewer
        images={images}
        initialIndex={currentIndex}
        isOpen={isFullscreen}
        onClose={closeFullscreen}
        onChangeImage={handleIndexChange}
      />
    </div>
  );
};
export default RoomPhotos;
