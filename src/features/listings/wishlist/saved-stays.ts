import type { Listing } from "../model/types";

/** The default (and, for now, only) wishlist collection. */
export const SAVED_STAYS_ID = "saved";

/** Saved listing ids → listings, skipping any that no longer exist. */
export const savedStays = (ids: string[], listings: Listing[]) =>
  ids
    .map((id) => listings.find((listing) => listing.id === id))
    .filter((listing): listing is Listing => Boolean(listing));

export const stayCount = (n: number) => `${n} ${n === 1 ? "stay" : "stays"}`;
