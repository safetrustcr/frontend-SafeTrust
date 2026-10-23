import {
  addMonths,
  isIsoDate,
  isIsoMonth,
  localToday,
  nightsBetween,
} from "./date-only";

export type IsoMonth = string; // YYYY-MM

export const Q_MAX_LENGTH = 80;
export const MAX_NIGHTS = 90;

export type DateTolerance = 0 | 1 | 2;

export type DateSearch =
  | { mode: "any" }
  | {
      mode: "exact";
      checkIn: string;
      checkOut: string;
      tolerance?: DateTolerance;
    }
  | {
      mode: "flexible";
      stay?: "weekend" | "week" | "month";
      months?: string[];
    };

export interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

export const GUEST_LIMITS = {
  party: 16,
  adults: 16,
  children: 15,
  infants: 5,
  pets: 3,
} as const;

export const NO_GUESTS: GuestCounts = {
  adults: 0,
  children: 0,
  infants: 0,
  pets: 0,
};

export type GuestSearch = GuestCounts;
export const ANY_GUESTS = NO_GUESTS;

export interface StaySearch {
  q: string;
  place?: string | null;
  guests: GuestCounts;
  dates: DateSearch;
}

export const EMPTY_STAY_SEARCH: StaySearch = {
  q: "",
  place: null,
  guests: NO_GUESTS,
  dates: { mode: "any" },
};

export const STAY_SEARCH_KEYS = [
  "q",
  "place",
  "adults",
  "children",
  "infants",
  "pets",
  "checkIn",
  "checkOut",
  "flex",
  "stay",
  "months",
] as const;

function count(params: URLSearchParams, key: string, max: number): number {
  const raw = params.get(key);
  if (!raw || !/^\d+$/.test(raw)) return 0;
  const n = parseInt(raw, 10);
  return Math.min(Math.max(0, n), max);
}

export function parseGuests(params: URLSearchParams): GuestCounts {
  const adults = count(params, "adults", GUEST_LIMITS.adults);
  const children = count(params, "children", GUEST_LIMITS.children);
  const infants = count(params, "infants", GUEST_LIMITS.infants);
  const pets = count(params, "pets", GUEST_LIMITS.pets);
  if (adults === 0 && children + infants + pets > 0) return NO_GUESTS;
  return { adults, children, infants, pets };
}

function parseMonths(raw: string | null, today: string): string[] {
  if (!raw) return [];
  const first = today.slice(0, 7);
  const last = addMonths(first, 11);
  return [...new Set(raw.split(","))]
    .filter((month) => isIsoMonth(month) && month >= first && month <= last)
    .sort();
}

export function parseDates(params: URLSearchParams, today: string): DateSearch {
  const checkIn = params.get("checkIn");
  const checkOut = params.get("checkOut");
  if (checkIn !== null || checkOut !== null) {
    const valid =
      checkIn !== null &&
      checkOut !== null &&
      isIsoDate(checkIn) &&
      isIsoDate(checkOut) &&
      checkIn >= today &&
      checkIn < checkOut &&
      nightsBetween(checkIn, checkOut) <= MAX_NIGHTS;
    if (!valid) return { mode: "any" };
    const flex = params.get("flex");
    const tolerance: DateTolerance = flex === "1" ? 1 : flex === "2" ? 2 : 0;
    return { mode: "exact", checkIn, checkOut, tolerance };
  }
  const stay = params.get("stay");
  const months = parseMonths(params.get("months"), today);
  if (
    (stay === "weekend" || stay === "week" || stay === "month") &&
    months.length > 0
  ) {
    return { mode: "flexible", stay, months };
  }
  return { mode: "any" };
}

export function parseStaySearch(
  params: URLSearchParams,
  today: string = localToday(),
): StaySearch {
  const q = (params.get("q") ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, Q_MAX_LENGTH);
  const place = params.get("place");
  return {
    q,
    place: place && /^[a-z0-9-]{1,48}$/.test(place) ? place : null,
    guests: parseGuests(params),
    dates: parseDates(params, today),
  };
}

export function readStaySearch(
  params: URLSearchParams,
  today: string = localToday(),
): StaySearch {
  return parseStaySearch(params, today);
}

export function writeStaySearch(
  search: StaySearch,
  query: URLSearchParams,
): URLSearchParams {
  for (const key of STAY_SEARCH_KEYS) query.delete(key);
  if (search.q) query.set("q", search.q);
  if (search.place) query.set("place", search.place);
  for (const key of ["adults", "children", "infants", "pets"] as const) {
    if (search.guests[key] > 0) query.set(key, String(search.guests[key]));
  }
  const { dates } = search;
  if (dates.mode === "exact") {
    query.set("checkIn", dates.checkIn);
    query.set("checkOut", dates.checkOut);
    if (dates.tolerance && dates.tolerance > 0) {
      query.set("flex", String(dates.tolerance));
    }
  } else if (dates.mode === "flexible") {
    if (dates.stay) query.set("stay", dates.stay);
    if (dates.months?.length) query.set("months", dates.months.join(","));
  }
  return query;
}
