"use client";

import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  isLiked?: boolean;
  onLike?: () => void;
  className?: string;
}

export default function FavoriteButton({
  isLiked = false,
  onLike,
  className,
}: FavoriteButtonProps) {
  const [isPressing, setIsPressing] = useState(false);

  const handleMouseDown = () => setIsPressing(true);
  const handleMouseUp = () => setIsPressing(false);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onLike}
      aria-label={isLiked ? "Saved (remove from wishlist)" : "Save to wishlist"}
      aria-pressed={isLiked}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={cn(
        "flex items-center gap-2 transition-all duration-200",
        isLiked && "text-red-500 border-red-200 bg-red-50 hover:bg-red-100",
        isPressing && "scale-95",
        className,
      )}
    >
      <Heart
        className={cn(
          "w-4 h-4 transition-transform duration-300",
          isLiked && "fill-red-500 text-red-500 scale-110",
          isPressing && "scale-90",
        )}
      />
      <span className="hidden sm:inline">{isLiked ? "Saved" : "Save"}</span>
    </Button>
  );
}
