import type { ApartmentListing, Location } from "@/types/hotel";
import type { Place } from "@/types/destination";
import { normalizeSearchText } from "@/lib/text";
import { DEMO_PLACES } from "@/lib/mockData/places";
import { STUB_DESTINATIONS } from "@/lib/mockData/destinations";

export type WhereSuggestion =
  | { kind: "province"; location: Location; label: string; count: number }
  | { kind: "place"; place: Place; label: string; count: number }
  | { kind: "listing"; id: string; label: string };

const MAX_RESULTS = 8;

function countByProvince(listings: ApartmentListing[], province: Location): number {
  return listings.filter((l) => l.location === province).length;
}

function countByPlace(listings: ApartmentListing[], placeId: string): number {
  return listings.filter((l) => l.placeId === placeId).length;
}

function matches(haystack: string, needle: string): boolean {
  if (!needle) return true;
  return haystack.includes(needle);
}

function prefixMatch(haystack: string, needle: string): boolean {
  if (!needle) return false;
  return haystack.startsWith(needle);
}

export function whereSuggestions(
  text: string,
  listings: ApartmentListing[],
): WhereSuggestion[] {
  const needle = normalizeSearchText(text);

  const provinceSuggestions: WhereSuggestion[] = STUB_DESTINATIONS
    .map((d) => ({
      kind: "province" as const,
      location: d.location,
      label: d.name,
      count: countByProvince(listings, d.location),
    }))
    .filter((s) => matches(normalizeSearchText(s.label), needle));

  const placeSuggestions: WhereSuggestion[] = DEMO_PLACES
    .map((p) => {
      const haystacks = [p.name, ...(p.aliases ?? [])].map(normalizeSearchText);
      return {
        kind: "place" as const,
        place: p,
        label: p.name,
        count: countByPlace(listings, p.id),
        haystacks,
      };
    })
    .filter((s) => s.haystacks.some((h) => matches(h, needle)))
    .map(({ haystacks, ...suggestion }) => suggestion);

  const listingSuggestions: WhereSuggestion[] = needle
    ? listings
        .map((l) => ({
          kind: "listing" as const,
          id: l.id,
          label: l.name,
          haystack: normalizeSearchText(l.name),
        }))
        .filter((s) => matches(s.haystack, needle))
        .map(({ haystack, ...suggestion }) => suggestion)
    : [];

  const rank = (s: WhereSuggestion): number => {
    if (!needle) return 0;
    const label = normalizeSearchText(s.label);
    return prefixMatch(label, needle) ? 0 : 1;
  };

  const order: WhereSuggestion[] = [
    ...provinceSuggestions,
    ...placeSuggestions,
    ...listingSuggestions,
  ];

  return order
    .map((s, i) => ({ s, i }))
    .sort((a, b) => rank(a.s) - rank(b.s) || a.i - b.i)
    .map(({ s }) => s)
    .slice(0, MAX_RESULTS);
}
