import { normalizeSearchText } from "@/lib/text";
import { listPlaces } from "../data/listings";
import {
  LISTING_LOCATIONS,
  type Listing,
  type Location,
  type Place,
} from "../model/types";

export type WhereSuggestion =
  | { kind: "province"; location: Location; label: string; count: number }
  | { kind: "place"; place: Place; label: string; count: number }
  | {
      kind: "listing";
      id: string;
      label: string;
      location: Location;
      placeId: string | null;
    };

export const MAX_WHERE_SUGGESTIONS = 8;

/**
 * 0: the main name starts with the needle, 1: a word in any field does,
 * 2: any field contains it, null: no match.
 */
function rank(needle: string, fields: string[]): number | null {
  const [main, ...rest] = fields.map(normalizeSearchText);
  if (main.startsWith(needle)) return 0;
  const all = [main, ...rest];
  if (
    all.some((field) => field.split(/[\s,]+/).some((w) => w.startsWith(needle)))
  ) {
    return 1;
  }
  return all.some((field) => field.includes(needle)) ? 2 : null;
}

/** Keeps matches only, best rank first; ties keep catalog order. */
function ranked<T>(
  items: T[],
  needle: string,
  fields: (item: T) => string[],
): T[] {
  if (!needle) return items;
  return items
    .map((item, index) => ({ item, index, rank: rank(needle, fields(item)) }))
    .filter((entry) => entry.rank !== null)
    .sort((a, b) => a.rank! - b.rank! || a.index - b.index)
    .map((entry) => entry.item);
}

/**
 * Where picker suggestions: provinces, then neighborhoods and towns, then
 * listing names. Matching is accent- and case-insensitive. Counts come from
 * `listings`, so pass the listings the results page would show for every
 * other active criterion; entries with no stays are left out. Empty text
 * suggests the provinces only.
 */
export function whereSuggestions(
  text: string,
  listings: Listing[],
): WhereSuggestion[] {
  const needle = normalizeSearchText(text);
  const count = (match: (listing: Listing) => boolean) =>
    listings.filter(match).length;

  const provinces: WhereSuggestion[] = ranked(
    [...LISTING_LOCATIONS],
    needle,
    (location) => [location],
  )
    .map((location) => ({
      kind: "province" as const,
      location,
      label: location,
      count: count((listing) => listing.location === location),
    }))
    .filter((suggestion) => suggestion.count > 0);
  if (!needle) return provinces.slice(0, MAX_WHERE_SUGGESTIONS);

  const places: WhereSuggestion[] = ranked(listPlaces(), needle, (place) => [
    place.name,
    ...(place.aliases ?? []),
    place.province,
  ])
    .map((place) => ({
      kind: "place" as const,
      place,
      label: `${place.name}, ${place.province}`,
      count: count((listing) => listing.placeId === place.id),
    }))
    .filter((suggestion) => suggestion.count > 0);

  const names: WhereSuggestion[] = ranked(listings, needle, (listing) => [
    listing.name,
    listing.address,
  ]).map((listing) => ({
    kind: "listing" as const,
    id: listing.id,
    label: listing.name,
    location: listing.location,
    placeId: listing.placeId ?? null,
  }));

  return [...provinces, ...places, ...names].slice(0, MAX_WHERE_SUGGESTIONS);
}

/** The draft fields a suggestion writes (issue #605, "What each choice writes"). */
export function suggestionDraft(suggestion: WhereSuggestion) {
  switch (suggestion.kind) {
    case "province":
      return { location: suggestion.location, place: null, q: "" };
    case "place":
      return {
        location: suggestion.place.province,
        place: suggestion.place.id,
        q: "",
      };
    case "listing":
      return {
        location: suggestion.location,
        place: suggestion.placeId,
        q: suggestion.label,
      };
  }
}
