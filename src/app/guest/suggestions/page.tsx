"use client";

import { useState } from "react";
import { WishlistAnnouncer, useSaveStay } from "@/features/listings";
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
  LayoutDashboard,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import HotelHeader from "@/components/listings/HotelHeader";
import { PageContainer } from "@/components/layouts/PageContainer";
import { APARTMENT_LISTINGS } from "@/lib/mockData/apartmentListings";
import { ListingLocation } from "@/features/listings/detail/ListingLocation";
import { ListingPrice } from "@/components/listings/ListingPrice";

export default function GuestSuggestionsPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(APARTMENT_LISTINGS[0].id);
  const { isSaved, toggleSaved, announcement } = useSaveStay();

  const selected = APARTMENT_LISTINGS.find((a) => a.id === selectedId)!;

  return (
    <div className="theme-guest min-h-screen bg-background text-foreground">
      {/* Standalone header */}
      <HotelHeader />
      <WishlistAnnouncer message={announcement} />

      <PageContainer width="wide" className="py-6">
        <nav
          aria-label="Listing views"
          className="mb-6 grid grid-cols-2 gap-2 sm:flex sm:justify-between"
        >
          <Button
            asChild
            variant="outline"
            className="min-h-11 h-auto whitespace-normal text-center gap-2 px-3 py-2 text-xs sm:text-sm"
          >
            <Link href="/rent">
              <ArrowLeft aria-hidden="true" className="h-4 w-4 shrink-0" />
              Browse rentals
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="min-h-11 h-auto whitespace-normal text-center gap-2 px-3 py-2 text-xs sm:text-sm"
          >
            <Link href="/dashboard/escrow-dashboard">
              <LayoutDashboard
                aria-hidden="true"
                className="h-4 w-4 shrink-0"
              />
              Switch to host view
            </Link>
          </Button>
        </nav>
        <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)_260px] lg:gap-6 xl:grid-cols-[280px_minmax(0,1fr)_260px]">
          {/* ── Left: Suggestions sidebar ── */}
          <aside className="min-w-0 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Suggestions
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {APARTMENT_LISTINGS.length} units available
              </p>
              <Link
                href="/rent"
                className="text-sm text-primary hover:text-primary/80
                           font-medium underline hover:no-underline"
              >
                Browse all →
              </Link>
            </div>

            <ul
              aria-label="Suggested stays"
              className="m-0 flex list-none gap-3 overflow-x-auto p-0 pb-2 lg:block lg:max-h-[75dvh] lg:space-y-3 lg:overflow-y-auto lg:pr-1"
            >
              {APARTMENT_LISTINGS.map((apt) => (
                <li
                  key={apt.id}
                  className={cn(
                    "relative flex w-72 shrink-0 items-start gap-2 rounded-xl border p-3 transition-colors lg:w-full",
                    selectedId === apt.id
                      ? "border-primary bg-accent"
                      : "border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        typeof window.matchMedia === "function" &&
                        window.matchMedia("(max-width: 1023px)").matches
                      ) {
                        router.push(`/rent/${apt.id}`);
                      } else {
                        setSelectedId(apt.id);
                      }
                    }}
                    aria-pressed={selectedId === apt.id}
                    aria-label={`Select ${apt.name}`}
                    className="flex min-w-0 flex-1 items-start gap-2 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {/* Thumbnail */}
                    <div
                      className="relative w-16 h-16 rounded-lg
                                    overflow-hidden shrink-0 bg-gray-200
                                    dark:bg-slate-700"
                    >
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
                        <p
                          className="text-sm font-semibold
                                      text-gray-900 dark:text-white
                                      line-clamp-2 leading-tight"
                        >
                          {apt.name}
                        </p>
                      </div>
                      <p
                        className="text-xs text-gray-600 dark:text-gray-400
                                    truncate"
                      >
                        {apt.address}
                      </p>
                      <div
                        className="flex flex-wrap items-center gap-x-2 gap-y-1
                                      text-xs text-gray-600 dark:text-gray-400"
                      >
                        <span>{apt.bedrooms}bd</span>
                        <span>·</span>
                        {apt.petFriendly && (
                          <>
                            <span>pet friendly</span>
                            <span>·</span>
                          </>
                        )}
                        <span>{apt.bathrooms} ba</span>
                        <ListingPrice
                          amount={apt.price}
                          size="sm"
                          className="ml-auto"
                        />
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleSaved(apt.id)}
                    aria-pressed={isSaved(apt.id)}
                    aria-label={
                      isSaved(apt.id)
                        ? `Remove ${apt.name} from Wishlists`
                        : `Save ${apt.name} to Wishlists`
                    }
                    className="relative z-10 shrink-0 rounded-full p-1 focus-visible:ring-2 focus-visible:ring-ring mt-0.5"
                  >
                    <Heart
                      aria-hidden="true"
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isSaved(apt.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-300 hover:text-red-400",
                      )}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* ── Center: Main image + details ── */}
          <main className="min-w-0 space-y-4">
            {/* Main image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-200 dark:bg-slate-700 sm:aspect-[16/10]">
              <Image
                src={selected.images[0]}
                alt={selected.name}
                fill
                className="object-cover"
                sizes="(max-width: 767px) 100vw, (max-width: 1279px) 65vw, 700px"
                priority
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              {selected.promoted && (
                <span
                  className="absolute bottom-4 left-4 inline-flex
                                 items-center gap-1 rounded-lg
                                 bg-primary px-3 py-1.5 text-xs font-semibold
                                 text-primary-foreground shadow-md"
                >
                  Promoted
                </span>
              )}
            </div>

            <div
              role="group"
              aria-label="More photos"
              className="flex gap-2 overflow-x-auto lg:hidden"
            >
              {selected.images.slice(1).map((image, index) => (
                <div
                  key={image}
                  className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-200"
                >
                  <Image
                    src={image}
                    alt={`${selected.name} photo ${index + 2}`}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Title & price */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selected.name}
                </h1>
                <p
                  className="flex items-center gap-1 text-sm text-gray-600
                              dark:text-gray-400 mt-1"
                >
                  <MapPin className="h-4 w-4 shrink-0" />
                  {selected.address}
                </p>
              </div>
              <div className="shrink-0 sm:text-right">
                <ListingPrice amount={selected.price} size="md" />
              </div>
            </div>

            {/* Badges / specs */}
            <div
              className="flex flex-wrap items-center gap-4 py-3
                            border-y border-gray-200 dark:border-slate-800
                            text-sm text-gray-600 dark:text-gray-300"
            >
              <span className="flex items-center gap-1.5">
                <Bed className="h-4 w-4 text-primary" />
                {selected.bedrooms} Bedrooms
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Bath className="h-4 w-4 text-primary" />
                {selected.bathrooms} Bathrooms
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <PawPrint className="h-4 w-4 text-primary" />
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

            {/* Where you'll stay map section */}
            <div className="border-t border-gray-200 dark:border-slate-800 pt-4">
              <ListingLocation listing={selected} />
            </div>
          </main>

          {/* ── Right: Booking / Escrow Box ── */}
          <aside className="min-w-0 space-y-4">
            <div
              className="rounded-2xl border border-gray-200
                            dark:border-slate-800 bg-white dark:bg-slate-800
                            p-4 shadow-sm space-y-4 sm:p-5 xl:sticky xl:top-6"
            >
              <div>
                <ListingPrice amount={selected.price} size="md" />
              </div>

              <div
                className="space-y-2 text-xs text-gray-600
                              dark:text-gray-400 pb-2 border-b
                              border-gray-100 dark:border-slate-700"
              >
                <div className="flex justify-between">
                  <span>Security deposit</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${(selected.price * 2).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Smart escrow protection</span>
                  <span className="font-medium text-green-700 dark:text-green-400">
                    Included
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push(`/rent/${selected.id}/book`)}
                className="w-full rounded-xl bg-primary py-3 text-center
                           text-sm font-semibold text-primary-foreground shadow-lg
                           shadow-primary/20 hover:bg-primary/90
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

              <Link
                href={`/dashboard/messages/new?listing=${encodeURIComponent(selected.id)}`}
                className="flex w-full items-center justify-center gap-2
                           rounded-xl border border-primary py-2.5 text-sm
                           font-semibold text-primary hover:bg-accent
                           transition-colors"
              >
                <MessageCircle aria-hidden="true" className="h-4 w-4" />
                Message host
              </Link>
            </div>
          </aside>
        </div>
      </PageContainer>
    </div>
  );
}
