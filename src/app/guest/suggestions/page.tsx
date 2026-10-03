"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  MapPin,
  Bed,
  PawPrint,
  Bath,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import HotelHeader from "@/components/listings/HotelHeader";
import { getConversationIdForApartment } from "@/lib/mockData/messages";
import { APARTMENT_LISTINGS } from "@/lib/mockData/apartmentListings";

export default function GuestSuggestionsPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(APARTMENT_LISTINGS[0].id);
  const [favorites, setFavorites] = useState<string[]>([]);

  const selected = APARTMENT_LISTINGS.find((a) => a.id === selectedId)!;
  const selectedConversationId = getConversationIdForApartment(selected.name);

  const toggleFavorite = (id: string) => {
    setFavorites((curr) =>
      curr.includes(id) ? curr.filter((f) => f !== id) : [...curr, id],
    );
  };

  return (
    <div
      className="min-h-screen bg-white dark:bg-slate-900
                    text-gray-900 dark:text-white"
    >
      {/* Standalone header */}
      <HotelHeader showHostSwitch />

      <div className="mx-auto max-w-[1280px] px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_220px] gap-6">
          {/* ── Left: Suggestions sidebar ── */}
          <aside className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Suggestions
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {APARTMENT_LISTINGS.length} units available
              </p>
              <Link
                href="/rent"
                className="text-sm text-orange-500 hover:text-orange-600
                           font-medium"
              >
                Browse all →
              </Link>
            </div>

            <div className="space-y-3">
              {APARTMENT_LISTINGS.map((apt) => (
                <li
                  key={apt.id}
                  className={cn(
                    "relative flex items-start gap-3 rounded-xl border p-3 list-none transition-colors",
                    selectedId === apt.id
                      ? "border-orange-400 bg-orange-50 dark:bg-orange-900/10"
                      : "border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(apt.id)}
                    aria-pressed={selectedId === apt.id}
                    className="flex flex-1 items-start gap-3 text-left after:absolute after:inset-0 focus-visible:outline-none"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 rounded-lg
                                    overflow-hidden shrink-0 bg-gray-200
                                    dark:bg-slate-700">
                      <Image
                        src={apt.images[0]}
                        alt={apt.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-sm font-semibold
                                      text-gray-900 dark:text-white
                                      line-clamp-2 leading-tight">
                          {apt.name}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400
                                    truncate">
                        {apt.address}
                      </p>
                      <div className="flex items-center gap-2
                                      text-xs text-gray-400 dark:text-gray-500">
                        <span>{apt.bedrooms}bd</span>
                        <span>·</span>
                        {apt.petFriendly && (
                          <>
                            <span>pet friendly</span>
                            <span>·</span>
                          </>
                        )}
                        <span>{apt.bathrooms} ba</span>
                        <span
                          className="ml-auto font-bold text-green-600
                                     dark:text-green-400"
                        >
                          ${apt.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleFavorite(apt.id)}
                    aria-pressed={favorites.includes(apt.id)}
                    aria-label={
                      favorites.includes(apt.id)
                        ? `Remove ${apt.name} from favorites`
                        : `Save ${apt.name} to favorites`
                    }
                    className="relative z-10 shrink-0 rounded-full p-1 focus-visible:ring-2 focus-visible:ring-orange-500 mt-0.5"
                  >
                    <Heart
                      aria-hidden="true"
                      className={cn(
                        "h-4 w-4 transition-colors",
                        favorites.includes(apt.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-300 hover:text-red-400",
                      )}
                    />
                  </button>
                </li>
              ))}
            </div>
          </aside>

          {/* ── Center: Main image + details ── */}
          <main className="space-y-4">
            {/* Main image */}
            <div
              className="relative w-full rounded-2xl overflow-hidden
                            bg-gray-200 dark:bg-slate-700"
              style={{ height: "340px" }}
            >
              <Image
                src={selected.images[0]}
                alt={selected.name}
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 60vw, 700px"
                priority
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              {selected.promoted && (
                <span className="absolute bottom-4 left-4 inline-flex
                                 items-center gap-1 rounded-lg
                                 bg-orange-500 px-3 py-1.5 text-xs font-semibold
                                 text-white shadow-md">
                  Promoted
                </span>
              )}
            </div>

            {/* Title & price */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selected.name}
                </h1>
                <p className="flex items-center gap-1 text-sm text-gray-500
                              dark:text-gray-400 mt-1">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {selected.address}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-green-600
                                 dark:text-green-400">
                  ${selected.price.toLocaleString()}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Per month
                </p>
              </div>
            </div>

            {/* Badges / specs */}
            <div className="flex flex-wrap items-center gap-4 py-3
                            border-y border-gray-200 dark:border-slate-800
                            text-sm text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-1.5">
                <Bed className="h-4 w-4 text-orange-500" />
                {selected.bedrooms} Bedrooms
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Bath className="h-4 w-4 text-orange-500" />
                {selected.bathrooms} Bathrooms
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <PawPrint className="h-4 w-4 text-orange-500" />
                {selected.petFriendly ? "Pet friendly" : "No pets"}
              </span>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                About this place
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {selected.description}
              </p>
            </div>
          </main>

          {/* ── Right: Booking / Escrow Box ── */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-gray-200
                            dark:border-slate-800 bg-white dark:bg-slate-800
                            p-5 shadow-sm space-y-4 sticky top-6">
              <div>
                <span className="text-2xl font-bold text-gray-900
                                 dark:text-white">
                  ${selected.price.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {" "}
                  / month
                </span>
              </div>

              <div className="space-y-2 text-xs text-gray-500
                              dark:text-gray-400 pb-2 border-b
                              border-gray-100 dark:border-slate-700">
                <div className="flex justify-between">
                  <span>Security deposit</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${(selected.price * 2).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Smart escrow protection</span>
                  <span className="font-medium text-green-600">Included</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push(`/rent/${selected.id}/escrow/create`)
                }
                className="w-full rounded-xl bg-orange-500 py-3 text-center
                           text-sm font-semibold text-white shadow-lg
                           shadow-orange-500/20 hover:bg-orange-600
                           transition-colors"
              >
                Book with Escrow
              </button>

              <button
                type="button"
                onClick={() => router.push(`/rent/${selected.id}`)}
                className="w-full rounded-xl border border-gray-200
                           dark:border-slate-700 py-2.5 text-center text-sm
                           font-medium text-gray-700 dark:text-gray-200
                           hover:bg-gray-50 dark:hover:bg-slate-700/50
                           transition-colors"
              >
                View full details
              </button>

              {selectedConversationId && (
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/dashboard/messages/${selectedConversationId}`,
                    )
                  }
                  className="flex w-full items-center justify-center gap-2
                             rounded-xl border border-orange-500 py-2.5 text-sm
                             font-semibold text-orange-500 hover:bg-orange-50
                             dark:hover:bg-orange-950/20 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message host
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
