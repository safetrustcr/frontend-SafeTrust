"use client";

import type { ApartmentListing } from "@/types/hotel";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Flame, Heart, MessageCircle } from "lucide-react";
import AmenityIcons from "./AmenityIcons";
import { ListingPrice } from "./ListingPrice";
import { listingHref } from "@/features/listings/search/links";

interface ApartmentCardProps {
  apartment: ApartmentListing;
  distanceKm?: number;
  loading?: "eager" | "lazy";
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  listingSearchParams?: string;
}

/** Render a rental card with booking and host-contact actions. */
export default function ApartmentCard({
  apartment,
  distanceKm,
  loading = "lazy",
  isFavorite = false,
  onToggleFavorite,
  listingSearchParams,
}: ApartmentCardProps) {
  const router = useRouter();
  const currentSearch = new URLSearchParams(listingSearchParams ?? "");
  const detailHref = listingHref(`/rent/${apartment.id}`, currentSearch);
  const bookingHref = listingHref(`/rent/${apartment.id}/book`, currentSearch);

  return (
    <article
      role="article"
      tabIndex={0}
      aria-label={apartment.name}
      onKeyDown={(e) => {
        if (
          (e.key === "Enter" || e.key === " ") &&
          e.target === e.currentTarget
        ) {
          e.preventDefault();
          router.push(detailHref);
        }
      }}
      className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[16px] border dark:border-slate-700 bg-white dark:bg-slate-800 transition-shadow motion-safe:hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] focus-within:ring-2 focus-within:ring-ring focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <div className="relative">
        <Image
          src={apartment.images[0]}
          alt={apartment.name}
          width={420}
          height={280}
          loading={loading}
          decoding="async"
          className="aspect-[3/2] w-full object-cover"
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
        />
        {apartment.promoted ? (
          <span className="absolute bottom-0 left-0 inline-flex items-center gap-1 rounded-tr-[10px] bg-primary px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.02em] text-primary-foreground">
            <Flame
              aria-hidden="true"
              data-testid="listing-card-promoted"
              className="h-3.5 w-3.5"
              fill="currentColor"
            />
            Promoted
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <ListingPrice amount={apartment.price} />
          {onToggleFavorite ? (
            <button
              type="button"
              onClick={() => onToggleFavorite(apartment.id)}
              aria-pressed={isFavorite}
              aria-label={
                isFavorite
                  ? `Remove ${apartment.name} from Wishlists`
                  : `Save ${apartment.name} to Wishlists`
              }
              className="relative z-10 shrink-0 rounded-full p-1 text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Heart
                aria-hidden="true"
                data-testid="listing-card-favorite"
                className={cn(
                  "h-5 w-5",
                  isFavorite ? "fill-red-500 text-red-500" : "text-red-500",
                )}
              />
            </button>
          ) : (
            <Heart
              aria-hidden="true"
              data-testid="listing-card-favorite"
              className={cn(
                "h-5 w-5",
                isFavorite ? "fill-red-500 text-red-500" : "text-red-500",
              )}
            />
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              <Link
                href={detailHref}
                className="after:absolute after:inset-0 focus-visible:outline-none"
              >
                {apartment.name}
              </Link>
            </h3>
            {distanceKm !== undefined && (
              <span
                data-testid="distance-label"
                className="relative z-10 shrink-0 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground"
              >
                {distanceKm.toFixed(1)} km
              </span>
            )}
          </div>
          <p className="line-clamp-1 text-xs text-gray-600 dark:text-gray-400">
            {apartment.address}
          </p>
          {distanceKm !== undefined ? (
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              ~{Math.round(distanceKm)} km away
            </p>
          ) : null}
        </div>

        {/* Fixed-height amenities zone keeps Book button aligned across all cards */}
        <div className="mt-3 min-h-14">
          <AmenityIcons
            bedrooms={apartment.bedrooms}
            bathrooms={apartment.bathrooms}
            petFriendly={apartment.petFriendly}
            compact
          />
        </div>

        <Button
          asChild
          className="relative z-10 mt-auto w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          <Link href={bookingHref}>Book</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="relative z-10 mt-2 w-full border-primary text-primary hover:bg-accent hover:text-primary font-semibold"
        >
          <Link
            href={`/dashboard/messages/new?listing=${encodeURIComponent(apartment.id)}`}
          >
            <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            Message host
          </Link>
        </Button>
      </div>
    </article>
  );
}
