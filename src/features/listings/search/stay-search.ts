import {
  addMonths,
  formatDateRangeSummary,
  isIsoDate,
  isIsoMonth,
  localToday,
  nightsBetween,
} from "./date-only";
import type { IsoDate } from "./date-only";

export type { IsoDate };

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

/** Name used by the stay matchers (match-stay) and the Who section. */
export type GuestCounts = GuestSearch;

export interface StaySearch {
  q: string;
  place: string | null; // place id; SD-04 validates it against the catalog
  guests: GuestSearch;
  dates: DateSearch;
}

/** Demo defaults; maintainers can change them in one place. */
export const GUEST_LIMITS = {
  party: 16,
  adults: 16,
  children: 15,
  infants: 5,
  pets: 5,
} as const;
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

/** No guest constraint: what an empty search matches. */
export const ANY_GUESTS = NO_GUESTS;
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

export function readStaySearch(
  params: URLSearchParams,
  today: string = localToday(),
): StaySearch {
  return parseStaySearch(params, today);
}

/** Writes the search into `query` in a stable order and omits defaults. */
export function writeStaySearch(
  search: StaySearch,
  query: URLSearchParams,
): URLSearchParams {
  for (const key of STAY_SEARCH_KEYS) query.delete(key);
  const q = search.q.replace(/\s+/g, " ").trim().slice(0, Q_MAX_LENGTH);
  if (q) query.set("q", q);
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

export function formatWhenSummary(dates: DateSearch): string {
  if (dates.mode === "any") return "Any dates";
  if (dates.mode === "exact") {
    const range = formatDateRangeSummary(dates.checkIn, dates.checkOut);
    const tolerance = dates.tolerance ?? 0;
    if (tolerance === 0) return range;
    return `${range} (± ${tolerance})`;
  }
  const months = dates.months ?? [];
  if (months.length === 0) return "Select months";
  const stayText =
    dates.stay === "weekend"
      ? "A weekend"
      : dates.stay === "week"
        ? "A week"
        : "A month";

  const monthNames = months.map((m) => {
    const [y, mon] = m.split("-").map(Number);
    const date = new Date(Date.UTC(y, mon - 1, 1));
    return new Intl.DateTimeFormat("en", {
      month: "short",
      timeZone: "UTC",
    }).format(date);
  });

  let monthsText = "";
  if (monthNames.length === 1) {
    monthsText = monthNames[0];
  } else if (monthNames.length === 2) {
    monthsText = `${monthNames[0]} or ${monthNames[1]}`;
  } else {
    monthsText = `${monthNames.slice(0, -1).join(", ")} or ${monthNames[monthNames.length - 1]}`;
  }

  return `${stayText} in ${monthsText}`;
}
