"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  isLiked?: boolean;
  likeCount?: number;
  onLike?: () => void;
  showCount?: boolean;
  className?: string;
}

export default function FavoriteButton({
  isLiked = false,
  likeCount = 0,
  onLike,
  showCount = true,
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
      {showCount && likeCount > 0 && (
        <Badge
          variant="secondary"
          className="ml-1 text-xs bg-transparent border-l border-border/50 pl-2"
        >
          {likeCount}
        </Badge>
      )}
    </Button>
  );
}
