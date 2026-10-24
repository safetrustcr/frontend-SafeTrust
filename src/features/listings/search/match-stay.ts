import type { ApartmentListing } from "@/types/hotel";
import { addDays } from "./date-only";
import type {
  DateSearch,
  GuestCounts,
  IsoDate,
  StaySearch,
} from "./stay-search";

/** Half-open [start, end): check-out day is free for the next guest. */
export interface StayRange {
  start: IsoDate;
  end: IsoDate;
}

export const overlaps = (a: StayRange, b: StayRange) =>
  a.start < b.end && a.end > b.start; // ISO dates compare correctly as strings

export function isRangeAvailable(
  listing: ApartmentListing,
  range: StayRange,
  today: IsoDate,
): boolean {
  const availability = listing.availability;
  if (!availability) return false; // unknown is not "available"
  const horizonEnd = addDays(today, availability.horizonDays);
  if (range.start < today || range.end > horizonEnd) return false;
  return !availability.booked.some(({ startDay, nights }) =>
    overlaps(range, {
      start: addDays(today, startDay),
      end: addDays(today, startDay + nights),
    }),
  );
}

export function matchesGuests(
  listing: ApartmentListing,
  guests: GuestCounts,
): boolean {
  const { adults, children, infants, pets } = guests;
  if (adults + children + infants + pets === 0) return true; // "Any guests"
  if (listing.maxGuests === undefined) return false;
  if (adults + children > listing.maxGuests) return false;
  if (infants > (listing.maxInfants ?? 0)) return false;
  if (pets > 0 && !listing.petFriendly) return false;
  return true;
}

/** Stays to try for a date search; SD-07 adds tolerance and flexible windows. */
export function candidateStays(dates: DateSearch, _today: IsoDate) {
  if (dates.mode === "any") return null;
  if (dates.mode === "exact")
    return [{ start: dates.checkIn, end: dates.checkOut }];
  return []; // flexible: SD-07
}

export function matchesDates(
  listing: ApartmentListing,
  dates: DateSearch,
  today: IsoDate,
): boolean {
  const candidates = candidateStays(dates, today);
  return (
    candidates === null ||
    candidates.some((range) => isRangeAvailable(listing, range, today))
  );
}

export function applyStaySearch(
  listings: ApartmentListing[],
  search: StaySearch,
  today: IsoDate,
): ApartmentListing[] {
  return listings.filter(
    (listing) =>
      matchesGuests(listing, search.guests) &&
      matchesDates(listing, search.dates, today),
  );
}
