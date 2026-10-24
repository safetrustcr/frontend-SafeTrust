"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/ui/demo-badge";
import { WishlistCard } from "@/components/dashboard/WishlistCard";
import { useApartmentListings } from "@/hooks/useApartmentListings";
import { useWishlist } from "./useWishlist";
import { SAVED_STAYS_ID, savedStays, stayCount } from "./saved-stays";

export function WishlistsIndex() {
  const wishlist = useWishlist();
  const stays = savedStays(wishlist.ids, useApartmentListings());

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            Wishlists <DemoBadge />
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Saved for this browser session only.
          </p>
        </div>
        <Button asChild variant="outline" className="text-sm">
          <Link href="/rent">Browse stays</Link>
        </Button>
      </div>

      {wishlist.loading ? (
        <div
          role="status"
          aria-label="Loading wishlists"
          className="aspect-square w-full max-w-xs animate-pulse rounded-2xl bg-muted"
        />
      ) : stays.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <WishlistCard
            name="Saved stays"
            subtitle={stayCount(stays.length)}
            images={stays.map((stay) => stay.images[0])}
            href={`/dashboard/favorites/${SAVED_STAYS_ID}`}
            priority
          />
        </div>
      ) : (
        <WishlistEmptyState />
      )}
    </div>
  );
}

export function WishlistEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
      <Heart aria-hidden="true" className="h-12 w-12 text-muted-foreground" />
      <p className="text-lg font-medium text-foreground">
        No saved stays yet. Tap ♥ on any stay.
      </p>
      <Button asChild>
        <Link href="/rent">Browse stays</Link>
      </Button>
    </div>
  );
}
