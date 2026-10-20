import type { ApartmentListing } from "@/types/hotel";
import { addDays } from "./date-only";
import type { DateSearch, IsoDate } from "./stay-search";

/** Half-open [start, end): check-out day is free for the next guest. */
export interface StayRange {
  start: IsoDate;
  end: IsoDate;
}

export const STAY_NIGHTS = { weekend: 2, week: 7, month: 30 } as const;

export const isFriday = (iso: string): boolean => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay() === 5;
};

export const daysInMonth = (month: string): number => {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
};

/**
 * Enumerate all candidate stay windows for a given date search.
 * Returns null for mode === "any" (matches any availability).
 */
export function candidateStays(
  dates: DateSearch,
  today: IsoDate,
): StayRange[] | null {
  if (dates.mode === "any") return null;

  if (dates.mode === "exact") {
    const out: StayRange[] = [];
    for (let shift = -dates.tolerance; shift <= dates.tolerance; shift++) {
      const start = addDays(dates.checkIn, shift);
      if (start >= today) {
        out.push({ start, end: addDays(dates.checkOut, shift) });
      }
    }
    return out;
  }

  const nights = STAY_NIGHTS[dates.stay];
  const out: StayRange[] = [];
  for (const month of dates.months) {
    const totalDays = daysInMonth(month);
    for (let day = 1; day <= totalDays; day++) {
      const start = `${month}-${String(day).padStart(2, "0")}`;
      if (start < today) continue;
      if (dates.stay === "weekend" && !isFriday(start)) continue;
      out.push({ start, end: addDays(start, nights) });
    }
  }
  return out;
}

/** ISO dates compare correctly as strings. */
export const overlaps = (a: StayRange, b: StayRange): boolean =>
  a.start < b.end && a.end > b.start;

/**
 * Checks if a stay range is free of bookings and within the listing's availability horizon.
 */
export function isRangeAvailable(
  listing: ApartmentListing,
  range: StayRange,
  today: IsoDate,
): boolean {
  const availability = listing.availability;
  if (!availability) return false; // unknown availability is treated as not available
  const horizonEnd = addDays(today, availability.horizonDays);
  if (range.start < today || range.end > horizonEnd) return false;
  return !availability.booked.some(({ startDay, nights }) =>
    overlaps(range, {
      start: addDays(today, startDay),
      end: addDays(today, startDay + nights),
    }),
  );
}

/**
 * A listing matches when at least one candidate stay is fully inside its
 * availability horizon and overlaps no booked night.
 */
export function matchesDates(
  listing: ApartmentListing,
  dates: DateSearch,
  today: IsoDate,
): boolean {
  const candidates = candidateStays(dates, today);
  if (candidates === null) return true;
  return candidates.some((range) => isRangeAvailable(listing, range, today));
}
