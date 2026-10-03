"use client";

import type { ApartmentListing } from "@/types/hotel";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaFireAlt } from "react-icons/fa";
import { MessageCircle } from "lucide-react";
import AmenityIcons from "./AmenityIcons";
import { formatListingPrice } from "./formatListingPrice";
import { getConversationIdForApartment } from "@/lib/mockData/messages";

interface ApartmentCardProps {
  apartment: ApartmentListing;
  distanceKm?: number;
  loading?: "eager" | "lazy";
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

/** Render a rental card with booking and host-contact actions. */
export default function ApartmentCard({
  apartment,
  distanceKm,
  loading = "lazy",
  isFavorite = apartment.favorite,
  onToggleFavorite,
}: ApartmentCardProps) {
  const conversationId = getConversationIdForApartment(apartment.name);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[16px] border dark:border-slate-700 bg-white dark:bg-slate-800 transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] focus-within:ring-2 focus-within:ring-orange-500">
      <div className="relative">
        <Image
          src={apartment.images[0]}
          alt={apartment.name}
          width={420}
          height={280}
          loading={loading}
          decoding="async"
          className="h-44 w-full object-cover"
        />
        {apartment.promoted ? (
          <span className="absolute bottom-0 left-0 inline-flex items-center gap-1 rounded-tr-lg bg-orange-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
            <FaFireAlt className="h-3.5 w-3.5" />
            Promoted
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold leading-none text-green-600">
              {formatListingPrice(apartment.price)}
            </span>
            <span className="pb-1 text-xs text-muted-foreground">
              Per month
            </span>
          </div>
          {onToggleFavorite ? (
            <button
              type="button"
              onClick={() => onToggleFavorite(apartment.id)}
              aria-pressed={isFavorite}
              aria-label={
                isFavorite
                  ? `Remove ${apartment.name} from favorites`
                  : `Save ${apartment.name} to favorites`
              }
              className="relative z-10 shrink-0 rounded-full p-1 text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              {isFavorite ? (
                <AiFillHeart className="h-5 w-5 fill-red-500 text-red-500" />
              ) : (
                <AiOutlineHeart className="h-5 w-5 text-red-500" />
              )}
            </button>
          ) : (
            <AiOutlineHeart
              className={cn(
                "h-5 w-5",
                isFavorite ? "fill-red-500 text-red-500" : "text-red-500",
              )}
            />
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            <Link
              href={`/rent/${apartment.id}`}
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {apartment.name}
            </Link>
          </h3>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {apartment.address}
          </p>
          {distanceKm !== undefined ? (
            <p className="text-xs font-medium text-gray-500">
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

        <Button asChild className="relative z-10 mt-auto w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold">
          <Link href={`/rent/${apartment.id}/escrow/create`}>Book</Link>
        </Button>
        {conversationId && (
          <Button
            asChild
            variant="outline"
            className="relative z-10 mt-2 w-full border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 font-semibold"
          >
            <Link href={`/dashboard/messages/${conversationId}`}>
              <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" /> Message host
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}
