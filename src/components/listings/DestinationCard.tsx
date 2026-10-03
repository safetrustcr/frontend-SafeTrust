"use client";

import type { HotelListing } from "@/@types/hotel";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AiOutlineHeart } from "react-icons/ai";
import { FaFireAlt } from "react-icons/fa";
import { MessageCircle } from "lucide-react";
import AmenityIcons from "./AmenityIcons";
import { formatListingPrice } from "./formatListingPrice";
import { getConversationIdForApartment } from "@/lib/mockData/messages";

interface DestinationCardProps {
  destination: HotelListing;
  loading?: "eager" | "lazy";
  onClick?: () => void;
}

export default function DestinationCard({
  destination,
  loading = "lazy",
  onClick,
}: DestinationCardProps) {
  const router = useRouter();
  const conversationId = getConversationIdForApartment(destination.name);

  return (
    <div
      onClick={onClick}
      className="group w-full overflow-hidden rounded-[16px] border dark:border-slate-700 bg-white dark:bg-slate-800 text-left transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
    >
      <div className="relative">
        <Image
          src={destination.images[0]}
          alt={destination.name}
          width={420}
          height={280}
          loading={loading}
          decoding="async"
          className="h-[170px] w-full object-cover"
        />
        {destination.promoted ? (
          <span className="absolute bottom-0 left-0 inline-flex items-center gap-1 rounded-tr-[10px] bg-orange-500 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.02em] text-white">
            <FaFireAlt className="h-3.5 w-3.5" />
            Promoted
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-end gap-2">
            <span className="text-[30px] font-semibold leading-none text-green-600">
              {formatListingPrice(destination.price)}
            </span>
            <span className="pb-1 text-xs text-gray-500">Per month</span>
          </div>
          <AiOutlineHeart
            className={cn(
              "h-5 w-5",
              destination.favorite
                ? "fill-red-500 text-red-500"
                : "text-red-500",
            )}
          />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {destination.name}
          </h3>
          <p className="line-clamp-1 text-xs text-gray-500">
            {destination.address}
          </p>
        </div>

        {/* Fixed-height amenities zone keeps Book button aligned across all cards */}
        <div className="mt-3 min-h-[56px]">
          <AmenityIcons
            bedrooms={destination.bedrooms}
            bathrooms={destination.bathrooms}
            petFriendly={destination.petFriendly}
            compact
          />
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="mt-auto w-full rounded-lg bg-orange-500 py-2 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-orange-600"
        >
          Book
        </button>
        {conversationId && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/messages/${conversationId}`);
            }}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg
                     border border-orange-500 py-2 px-4 text-sm font-semibold
                     text-orange-500 transition-colors duration-200
                     hover:bg-orange-50 dark:hover:bg-orange-900/10"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Message host
          </button>
        )}
      </div>
    </div>
  );
}
