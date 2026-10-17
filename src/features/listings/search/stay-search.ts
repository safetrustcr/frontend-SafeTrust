"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { isIsoDate, localToday, type IsoDate } from "./date-only";

/** Who the guest wants to host. Zero everywhere means "Any guests". */
export interface GuestSearch {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

/**
 * When to stay. `exact` is one half-open night range; `flexible` windows
 * are parsed by SD-07 and currently match nothing.
 */
export type DateSearch =
  | { mode: "any" }
  | { mode: "exact"; checkIn: IsoDate; checkOut: IsoDate }
  | { mode: "flexible" };

export interface StaySearch {
  guests: GuestSearch;
  dates: DateSearch;
}

export const ANY_GUESTS: GuestSearch = {
  adults: 0,
  children: 0,
  infants: 0,
  pets: 0,
};
export const ANY_DATES: DateSearch = { mode: "any" };
export const ANY_STAY_SEARCH: StaySearch = {
  guests: ANY_GUESTS,
  dates: ANY_DATES,
};

type GuestKey = keyof GuestSearch;

const guestCount = (params: URLSearchParams, key: GuestKey) => {
  const value = Number(params.get(key));
  return Number.isInteger(value) && value > 0 ? value : 0;
};

/**
 * Parse stay params from the URL (SD-01):
 * `?adults=&children=&infants=&pets=&checkIn=&checkOut=`.
 * Malformed or incomplete values fall back to "Any".
 */
export function parseStaySearch(params: URLSearchParams): StaySearch {
  const guests: GuestSearch = {
    adults: guestCount(params, "adults"),
    children: guestCount(params, "children"),
    infants: guestCount(params, "infants"),
    pets: guestCount(params, "pets"),
  };
  const checkIn = params.get("checkIn") ?? "";
  const checkOut = params.get("checkOut") ?? "";
  const dates: DateSearch =
    isIsoDate(checkIn) && isIsoDate(checkOut) && checkIn < checkOut
      ? { mode: "exact", checkIn, checkOut }
      : ANY_DATES;
  return { guests, dates };
}

/** Stay constraints from the current URL plus the guest's local "today". */
export function useStaySearch(): { search: StaySearch; today: IsoDate } {
  const params = useSearchParams();
  const paramsString = params.toString();
  const search = useMemo(
    () => parseStaySearch(new URLSearchParams(paramsString)),
    [paramsString],
  );
  const today = useMemo(() => localToday(), []);
  return { search, today };
}
