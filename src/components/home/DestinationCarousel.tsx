"use client";

import Image from "next/image";
import Link from "next/link";

import {
  listDestinations,
  useListings,
  type Listing,
} from "@/features/listings";

/** One place there is something to book, and how much. */
interface Destination {
  location: string;
  listings: number;
  imageUrl?: string;
}

/**
 * Group the listings `/rent` browses by location.
 *
 * Derived rather than hard-coded so the strip and the listing page cannot
 * disagree about where there is something to book, and so a destination
 * disappears on its own when its last listing goes.
 */
function destinationsFromListings(listings: Listing[]): Destination[] {
  const photos = new Map<string, string>(
    listDestinations().map(({ location, imageUrl }) => [location, imageUrl]),
  );
  const counts = new Map<string, number>();
  for (const listing of listings) {
    counts.set(listing.location, (counts.get(listing.location) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([location, listings]) => ({
      location,
      listings,
      imageUrl: photos.get(location),
    }))
    .sort(
      (left, right) =>
        right.listings - left.listings ||
        left.location.localeCompare(right.location),
    );
}

/**
 * A horizontally scrollable strip of the destinations that currently have
 * listings, each linking into the public browsing page.
 */
export default function DestinationCarousel() {
  const listings = useListings();
  const destinations = destinationsFromListings(listings);

  if (destinations.length === 0) return null;

  return (
    <div className="mx-auto max-w-5xl">
      <h2 className="home-ink mb-6 text-center text-3xl font-bold">
        Popular destinations
      </h2>
      <ul
        className="scrollbar-soft flex snap-x snap-mandatory scroll-px-2 gap-4 overflow-x-auto px-2 pb-4 pt-3"
        aria-label="Destinations with listings"
      >
        {destinations.map(({ location, listings, imageUrl }) => (
          <li key={location} className="w-56 shrink-0 snap-start">
            <Link
              href="/rent"
              className="home-destination focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="home-destination-photo bg-muted">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt=""
                    fill
                    sizes="224px"
                    className="object-cover"
                  />
                )}
                <span className="home-destination-frost block">
                  <span className="home-ink block text-lg font-semibold">
                    {location}
                  </span>
                  <span className="home-ink mt-0.5 block text-sm">
                    {listings} {listings === 1 ? "stay" : "stays"}
                  </span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
