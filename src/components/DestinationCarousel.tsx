"use client";

import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { DEMO_PLACES } from "@/lib/mockData/places";
import type { ApartmentListing } from "@/types/hotel";

/** One place there is something to book, and how much. */
interface Destination {
  location: string;
  listings: number;
}

/**
 * Group the listings `/rent` browses by location.
 *
 * Derived rather than hard-coded so the strip and the listing page cannot
 * disagree about where there is something to book, and so a destination
 * disappears on its own when its last listing goes.
 */
function destinationsFromListings(listings: ApartmentListing[]): Destination[] {
  const counts = new Map<string, number>();
  for (const listing of listings) {
    counts.set(listing.location, (counts.get(listing.location) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([location, listings]) => ({ location, listings }))
    .sort(
      (left, right) =>
        right.listings - left.listings ||
        left.location.localeCompare(right.location),
    );
}

/**
 * Build the `/rent` URL for a province, clearing any `place` that belongs to
 * a different province so an incompatible selection cannot survive the change.
 */
function provinceHref(location: string): string {
  const params = new URLSearchParams();
  params.set("location", location);
  return `/rent?${params.toString()}`;
}

/**
 * A horizontally scrollable strip of the destinations that currently have
 * listings, each linking into the public browsing page.
 */
export default function DestinationCarousel() {
  const destinations = destinationsFromListings(DEMO_PLACES);

  if (destinations.length === 0) return null;

  return (
    <div className="mx-auto max-w-5xl">
      <h2 className="mb-6 text-center text-3xl font-semibold">
        Popular destinations
      </h2>
      <ul
        className="scrollbar-soft flex snap-x snap-mandatory scroll-px-2 gap-4 overflow-x-auto px-2 pb-3"
        aria-label="Destinations with listings"
      >
        {destinations.map(({ location, listings: count }) => (
          <li key={location} className="w-56 shrink-0 snap-start">
            <Link
              href={provinceHref(location)}
              className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Card className="h-full transition-colors hover:bg-accent">
                <CardContent className="p-5">
                  <p className="text-lg font-semibold">{location}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {count} {count === 1 ? "stay" : "stays"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
