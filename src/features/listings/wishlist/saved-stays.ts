import type { ApartmentListing } from "@/types/hotel";

/** The default (and, for now, only) wishlist collection. */
export const SAVED_STAYS_ID = "saved";

/** Saved listing ids → listings, skipping any that no longer exist. */
export const savedStays = (ids: string[], listings: ApartmentListing[]) =>
  ids
    .map((id) => listings.find((listing) => listing.id === id))
    .filter((listing): listing is ApartmentListing => Boolean(listing));

export const stayCount = (n: number) => `${n} ${n === 1 ? "stay" : "stays"}`;
