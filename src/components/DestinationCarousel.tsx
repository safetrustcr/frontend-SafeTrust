import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { STUB_HOTELS } from "@/lib/mockData/hotels";

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
function destinationsFromListings(): Destination[] {
  const counts = new Map<string, number>();
  for (const listing of STUB_HOTELS) {
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
 * A horizontally scrollable strip of the destinations that currently have
 * listings, each linking into the public browsing page.
 */
export default function DestinationCarousel() {
  const destinations = destinationsFromListings();

  if (destinations.length === 0) return null;

  return (
    <div className="mx-auto max-w-5xl">
      <h2 className="mb-6 text-center text-3xl font-semibold">
        Popular destinations
      </h2>
      <ul
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        aria-label="Destinations with listings"
      >
        {destinations.map(({ location, listings }) => (
          <li key={location} className="w-56 shrink-0 snap-start">
            <Link
              href="/rent"
              className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Card className="h-full transition-colors hover:bg-accent">
                <CardContent className="p-5">
                  <p className="text-lg font-semibold">{location}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {listings} {listings === 1 ? "stay" : "stays"}
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
