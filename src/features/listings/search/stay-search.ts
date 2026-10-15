import { addMonths, isIsoDate, isIsoMonth, nightsBetween } from "./date-only";

export type IsoDate = string; // "YYYY-MM-DD", a local calendar date (never a timestamp)
export type IsoMonth = string; // "YYYY-MM"
export type StayLength = "weekend" | "week" | "month";
export type DateTolerance = 0 | 1 | 2;

export type DateSearch =
  | { mode: "any" }
  | {
      mode: "exact";
      checkIn: IsoDate;
      checkOut: IsoDate;
      tolerance: DateTolerance;
    }
  | { mode: "flexible"; stay: StayLength; months: IsoMonth[] };

export interface GuestSearch {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

export interface StaySearch {
  q: string;
  place: string | null; // place id; SD-04 validates it against the catalog
  guests: GuestSearch;
  dates: DateSearch;
}

/** Demo defaults; maintainers can change them in one place. */
export const GUEST_LIMITS = { party: 16, infants: 5, pets: 5 } as const;
export const MAX_NIGHTS = 90;
export const Q_MAX_LENGTH = 80;

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

export const NO_GUESTS: GuestSearch = {
  adults: 0,
  children: 0,
  infants: 0,
  pets: 0,
};
export const EMPTY_STAY_SEARCH: StaySearch = {
  q: "",
  place: null,
  guests: NO_GUESTS,
  dates: { mode: "any" },
};

const count = (params: URLSearchParams, key: string, max: number) => {
  const raw = params.get(key);
  // Integers only: "-1", "1.5", "1e2" and "abc" all become 0.
  return raw !== null && /^\d{1,3}$/.test(raw) ? Math.min(Number(raw), max) : 0;
};

export function parseGuests(params: URLSearchParams): GuestSearch {
  const adults = count(params, "adults", GUEST_LIMITS.party);
  const children = Math.min(
    count(params, "children", GUEST_LIMITS.party),
    GUEST_LIMITS.party - adults,
  );
  const infants = count(params, "infants", GUEST_LIMITS.infants);
  const pets = count(params, "pets", GUEST_LIMITS.pets);
  // Children, infants or pets without an adult is not a valid party.
  if (adults === 0 && children + infants + pets > 0) return NO_GUESTS;
  return { adults, children, infants, pets };
}

function parseMonths(raw: string | null, today: IsoDate): IsoMonth[] {
  if (!raw) return [];
  const first = today.slice(0, 7);
  const last = addMonths(first, 11); // rolling 12-month window
  return [...new Set(raw.split(","))]
    .filter((month) => isIsoMonth(month) && month >= first && month <= last)
    .sort();
}

export function parseDates(
  params: URLSearchParams,
  today: IsoDate,
): DateSearch {
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
    if (!valid) return { mode: "any" }; // never apply half a range
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
  today: IsoDate,
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

/** Writes the search into `query` in a stable order and omits defaults. */
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
    if (dates.tolerance > 0) query.set("flex", String(dates.tolerance));
  } else if (dates.mode === "flexible") {
    query.set("stay", dates.stay);
    query.set("months", dates.months.join(","));
  }
  return query;
}
