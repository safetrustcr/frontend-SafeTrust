import { addDays, isIsoDate, nightsBetween } from "./date-only";
import type { ApartmentListing, ApartmentBooking } from "@/types/hotel";
import type { DateSearch, GuestCounts, StaySearch } from "./stay-search";

export interface StayRange {
  start: string;
  end: string;
}

export function overlaps(left: StayRange, right: StayRange): boolean {
  return left.start < right.end && right.start < left.end;
}

export function candidateStays(
  dates: DateSearch,
  today: string,
): StayRange[] | null {
  if (dates.mode === "any") return null;
  if (dates.mode === "flexible") return [];
  if (
    !isIsoDate(dates.checkIn) ||
    !isIsoDate(dates.checkOut) ||
    dates.checkIn < today ||
    dates.checkIn >= dates.checkOut
  ) {
    return [];
  }

  const tolerance = dates.tolerance ?? 0;
  return Array.from({ length: tolerance * 2 + 1 }, (_, index) => {
    const offset = index - tolerance;
    return {
      start: addDays(dates.checkIn, offset),
      end: addDays(dates.checkOut, offset),
    };
  }).filter((range) => range.start >= today);
}

export function matchesGuests(
  listing: ApartmentListing,
  guests: GuestCounts,
): boolean {
  const hasGuestConstraint =
    guests.adults + guests.children + guests.infants + guests.pets > 0;
  if (!hasGuestConstraint) return true;
  if (
    listing.maxGuests === undefined ||
    listing.maxInfants === undefined ||
    guests.adults + guests.children > listing.maxGuests ||
    guests.infants > listing.maxInfants ||
    (guests.pets > 0 && !listing.petFriendly)
  ) {
    return false;
  }
  return true;
}

export function isRangeAvailable(
  listing: ApartmentListing,
  range: StayRange,
  today: string,
): boolean {
  const availability = listing.availability;
  if (
    !availability ||
    !isIsoDate(range.start) ||
    !isIsoDate(range.end) ||
    range.start < today ||
    range.start >= range.end
  ) {
    return false;
  }

  const endDay = nightsBetween(today, range.end);
  if (endDay > availability.horizonDays) return false;

  return !availability.booked.some((booking: ApartmentBooking) =>
    overlaps(range, {
      start: addDays(today, booking.startDay),
      end: addDays(today, booking.startDay + booking.nights),
    }),
  );
}

export function matchesDates(
  listing: ApartmentListing,
  dates: DateSearch,
  today: string,
): boolean {
  const candidates = candidateStays(dates, today);
  if (candidates === null) return true;
  return candidates.some((range) => isRangeAvailable(listing, range, today));
}

export function applyStaySearch(
  listings: ApartmentListing[],
  search: StaySearch,
  today: string,
): ApartmentListing[] {
  return listings.filter(
    (listing) =>
      matchesGuests(listing, search.guests) &&
      matchesDates(listing, search.dates, today),
  );
}
