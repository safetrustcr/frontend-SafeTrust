"use client";

import type { ApartmentListing } from "@/types/hotel";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AmenityIcons from "./AmenityIcons";
import { ListingPrice } from "./ListingPrice";
import ImageGallery from "./ImageGallery";
import { ListingLocation } from "@/features/listings/detail/ListingLocation";
import {
  BookingSummaryBar,
  type BookingIntent,
} from "@/features/listings/detail/BookingSummaryBar";

interface ApartmentDetailProps {
  apartment: ApartmentListing;
  onBook: () => void;
  isSaved?: boolean;
  onToggleSaved?: () => void;
  intent?: BookingIntent;
  onBookExact?: (params: {
    checkIn: string;
    checkOut: string;
    adults: number;
  }) => void;
}

/** Render rental details, amenities, owner information, and booking action. */
export default function ApartmentDetail({
  apartment,
  onBook,
  isSaved = false,
  onToggleSaved,
  intent,
  onBookExact,
}: ApartmentDetailProps) {
  return (
    <section className="flex-1 px-6 py-8 pb-28 lg:pb-8 lg:px-10">
      <ImageGallery
        images={apartment.images}
        promoted={apartment.promoted}
        altText={apartment.name}
      />

      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-[34px] font-semibold tracking-[-0.04em] text-foreground">
              {apartment.name}
            </h1>
            {onToggleSaved && (
              <button
                type="button"
                onClick={onToggleSaved}
                aria-pressed={isSaved}
                aria-label={
                  isSaved
                    ? `Remove ${apartment.name} from Wishlists`
                    : `Save ${apartment.name} to Wishlists`
                }
                className="mt-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-red-500 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Heart
                  aria-hidden="true"
                  className={cn("h-6 w-6", isSaved && "fill-red-500")}
                />
              </button>
            )}
          </div>

          <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-accent-foreground">
              <MapPin
                aria-hidden="true"
                data-testid="apartment-detail-location-icon"
                className="h-4 w-4"
                fill="currentColor"
              />
            </span>
            <span>{apartment.address}</span>
          </div>

          <div className="mt-8">
            <AmenityIcons
              bedrooms={apartment.bedrooms}
              bathrooms={apartment.bathrooms}
              petFriendly={apartment.petFriendly}
            />
          </div>
        </div>

        <div className="w-full rounded-xl lg:max-w-52">
          <button
            type="button"
            onClick={onBook}
            className="w-full rounded-[8px] bg-primary px-6 py-4 text-xl font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
          >
            BOOK
          </button>
          <Button asChild variant="outline" className="mt-3 min-h-11 w-full">
            <Link
              href={`/dashboard/messages/new?listing=${encodeURIComponent(apartment.id)}`}
            >
              <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
              Message host
            </Link>
          </Button>
          <div className="mt-4">
            <ListingPrice amount={apartment.price} size="lg" />
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              {apartment.owner.name}
            </span>
            <Image
              src={apartment.owner.avatar}
              alt={apartment.owner.name}
              width={34}
              height={34}
              className="h-9 w-9 rounded-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="mt-10 max-w-3xl">
        <h2 className="text-[22px] font-semibold text-foreground">
          Apartment details
        </h2>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {apartment.description}
        </p>
      </div>

      <div className="mt-10 max-w-3xl border-t border-border pt-8">
        <ListingLocation listing={apartment} />
      </div>

      <BookingSummaryBar
        listing={apartment}
        intent={intent}
        onBookExact={onBookExact || (() => onBook())}
      />
    </section>
  );
}
