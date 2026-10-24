"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DemoBadge } from "@/components/ui/demo-badge";
import ApartmentGrid from "@/components/listings/ApartmentGrid";
import { useApartmentListings } from "@/hooks/useApartmentListings";
import { useWishlist } from "./useWishlist";
import { useSaveStay } from "./useSaveStay";
import { savedStays, stayCount } from "./saved-stays";
import { WishlistAnnouncer } from "./WishlistAnnouncer";
import { WishlistEmptyState } from "./WishlistsIndex";

function WishlistSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading saved stays"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}

export function WishlistDetail() {
  const wishlist = useWishlist();
  const { toggleSaved, announcement } = useSaveStay();
  const stays = savedStays(wishlist.ids, useApartmentListings());

  return (
    <section
      aria-labelledby="wl-title"
      className="mx-auto max-w-5xl space-y-6 p-6"
    >
      <Link
        href="/dashboard/favorites"
        className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Wishlists
      </Link>
      <div>
        <h1
          id="wl-title"
          className="flex items-center gap-2 text-2xl font-bold"
        >
          Saved stays <DemoBadge />
        </h1>
        <p className="text-sm text-muted-foreground">
          {wishlist.loading ? "Loading…" : stayCount(stays.length)} · saved for
          this browser session only
        </p>
      </div>
      <WishlistAnnouncer message={announcement} />

      {wishlist.loading ? (
        <WishlistSkeleton />
      ) : stays.length === 0 ? (
        <WishlistEmptyState />
      ) : (
        <ApartmentGrid
          apartments={stays}
          favorites={wishlist.ids}
          onToggleFavorite={toggleSaved}
          renderCard={(card, index) => (
            <div className="flex h-full min-w-0 flex-col gap-2">
              {card}
              <Link
                href={`/rent/${stays[index].id}`}
                aria-label={`View stay: ${stays[index].name}`}
                className="inline-flex min-h-11 items-center justify-center rounded-md text-sm font-semibold text-primary underline-offset-2 hover:underline"
              >
                View stay
              </Link>
            </div>
          )}
        />
      )}
    </section>
  );
}
