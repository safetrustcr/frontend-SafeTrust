import type { Listing } from "../model/types";
import { listListings } from "../data/listings";

/** The listings the public browsing pages show (demo data for now). */
export function useListings(): Listing[] {
  return listListings();
}
