import type { Destination, Listing, Place } from "../model/types";
import { STUB_DESTINATIONS } from "./demo-destinations";
import { DEMO_PLACES } from "./demo-places";
import { APARTMENT_LISTINGS } from "./demo-listings";

/**
 * Listing read model. Hotels and apartments come from the same records.
 * Demo data until the listings API is wired; callers do not import the
 * fixtures directly, so swapping the source touches only this file.
 */
export function listListings(): Listing[] {
  return APARTMENT_LISTINGS;
}

export function getListing(id: string): Listing | undefined {
  return APARTMENT_LISTINGS.find((listing) => listing.id === id);
}

/** Other stays to show next to `activeId` (at most five). */
export function listSuggestedListings(activeId: string): Listing[] {
  return APARTMENT_LISTINGS.filter((listing) => listing.id !== activeId).slice(
    0,
    5,
  );
}

/** Province tiles for the /rent destination carousel. */
export function listDestinations(): Destination[] {
  return STUB_DESTINATIONS;
}

/** Neighborhoods and towns the Where picker suggests. */
export function listPlaces(): Place[] {
  return DEMO_PLACES;
}

export function getPlace(id: string): Place | undefined {
  return DEMO_PLACES.find((place) => place.id === id);
}
