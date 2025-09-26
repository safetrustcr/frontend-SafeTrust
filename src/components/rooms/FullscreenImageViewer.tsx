"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { X, ZoomIn, ZoomOut, Minus, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FullscreenImageViewerProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onChangeImage: (index: number) => void;
}

export default function FullscreenImageViewer({
  images,
  initialIndex,
  isOpen,
  onClose,
  onChangeImage,
}: FullscreenImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        goToPrevious();
        break;
      case 'ArrowRight':
        goToNext();
        break;
      case '+':
      case '=':
        zoomIn();
        break;
      case '-':
      case '_':
        zoomOut();
        break;
      case '0':
        resetZoom();
        break;
    }
  }, [isOpen, onClose]);

  // Close on escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Reset zoom and position when changing images
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    onChangeImage((currentIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    onChangeImage((currentIndex + 1) % images.length);
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 1));
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    
    const x = e.clientX - dragStart.x;
    const y = e.clientY - dragStart.y;
    
    setPosition({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header with close button */}
      <div className="flex justify-between items-center p-4 bg-black/50 text-white">
        <div className="text-sm">
          {currentIndex + 1} / {images.length}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomIn}
            className="text-white hover:bg-white/20"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomOut}
            className="text-white hover:bg-white/20"
            disabled={scale <= 1}
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={resetZoom}
            className="text-white hover:bg-white/20"
            disabled={scale === 1}
            aria-label="Reset zoom"
          >
            <Maximize className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main image container */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </>
        )}

        {/* Image with transform */}
        <div
          ref={imageRef}
          className="relative w-full h-full flex items-center justify-center"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          style={{
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
        >
          <div
            className="relative"
            style={{
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              maxWidth: '90%',
              maxHeight: '90%',
            }}
          >
            <Image
              src={images[currentIndex]}
              alt={`Room view ${currentIndex + 1}`}
              width={1200}
              height={800}
              className="max-w-full max-h-[80vh] object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="h-24 bg-black/50 p-2 overflow-x-auto flex justify-center">
          <div className="flex space-x-2 h-full">
            {images.map((src, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  onChangeImage(index);
                }}
                className={`h-full aspect-video flex-shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                  index === currentIndex
                    ? 'border-white scale-105'
                    : 'border-transparent hover:border-gray-400 opacity-70 hover:opacity-100'
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={src}
                  alt={`""`}
                  width={120}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
