"use client";

import { Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Hotel } from "@/@types/hotel.entity";

interface HotelCardProps {
  hotel: Hotel;
  onToggleFavorite: (id: number) => void;
}

export default function HotelCard({ hotel, onToggleFavorite }: HotelCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img
          src={hotel.image || "/placeholder.svg"}
          alt={hotel.name}
          className="w-full h-[150px] object-cover"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full h-8 w-8"
          onClick={() => onToggleFavorite(hotel.id)}
        >
          <Heart
            className={`h-5 w-5 ${hotel.isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"}`}
          />
        </Button>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg">{hotel.name}</h3>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{hotel.location}</span>
        </div>
        <div className="flex items-center mt-1">
          <div className="flex">
            {Array(Math.floor(hotel.stars))
              .fill(0)
              .map((_, i) => (
                <svg
                  key={i}
                  className="w-4 h-4 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              ))}
            {hotel.stars % 1 !== 0 && (
              <svg
                className="w-4 h-4 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <defs>
                  <linearGradient id="halfStarGradient">
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="#D1D5DB" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#halfStarGradient)"
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                ></path>
              </svg>
            )}
          </div>
          <span className="text-sm text-gray-500 ml-1">{hotel.stars}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div>
          <span className="font-bold text-lg">${hotel.price.toFixed(2)}</span>
          <span className="text-sm text-gray-500">/night</span>
        </div>
      </CardFooter>
    </Card>
  );
}
