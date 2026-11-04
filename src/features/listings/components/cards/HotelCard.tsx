"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Star } from "lucide-react";
import type { Listing } from "../../model/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ListingPrice } from "./ListingPrice";

interface HotelCardProps {
  hotel: Listing;
  saved: boolean;
  onToggleSaved: (id: string) => void;
  from?: string | null;
  to?: string | null;
}

function hotelHref(hotel: Listing, from?: string | null, to?: string | null) {
  const params = new URLSearchParams();
  if (from && to) {
    params.set("from", from);
    params.set("to", to);
  }
  const query = params.toString();
  return `/hotels/${hotel.id}${query ? `?${query}` : ""}`;
}

export default function HotelCard({
  hotel,
  saved,
  onToggleSaved,
  from,
  to,
}: HotelCardProps) {
  return (
    <Card className="overflow-hidden" data-testid="hotel-card">
      <div className="relative h-[150px] w-full">
        <Image
          src={hotel.images[0] || "/img/placeholder.svg"}
          alt={hotel.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
        <button
          type="button"
          aria-pressed={saved}
          aria-label={
            saved
              ? `Remove ${hotel.name} from wishlist`
              : `Save ${hotel.name} to wishlist`
          }
          onClick={() => onToggleSaved(hotel.id)}
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-700 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Heart
            aria-hidden="true"
            className={`h-5 w-5 ${
              saved ? "fill-rose-500 text-rose-500" : "text-rose-400"
            }`}
          />
        </button>
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold">
          <Link href={hotelHref(hotel, from, to)} className="hover:underline">
            {hotel.name}
          </Link>
        </h3>
        <div className="mt-1 flex items-start gap-1 text-sm text-muted-foreground">
          <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{hotel.address}</span>
        </div>
        <div className="mt-2 flex items-center gap-1 text-sm">
          <Star
            aria-hidden="true"
            className="h-4 w-4 fill-yellow-400 text-yellow-400"
          />
          <span>{hotel.rating.toFixed(1)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <ListingPrice amount={hotel.price} size="sm" />
      </CardFooter>
    </Card>
  );
}
