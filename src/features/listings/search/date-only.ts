import { isIsoDate } from "@/lib/date";

export { isIsoDate };

/** "YYYY-MM-DD", a local calendar date (never a timestamp). */
export type IsoDate = string;

const pad = (n: number) => String(n).padStart(2, "0");
const parts = (iso: string) =>
  iso.split("-").map(Number) as [number, number, number];

export const isIsoMonth = (value: string) =>
  /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

export function addDays(iso: string, days: number): string {
  const [y, m, d] = parts(iso);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function nightsBetween(start: string, end: string): number {
  const [ys, ms, ds] = parts(start);
  const [ye, me, de] = parts(end);
  return Math.round(
    (Date.UTC(ye, me - 1, de) - Date.UTC(ys, ms - 1, ds)) / 86_400_000,
  );
}

export function addMonths(month: string, count: number): string {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + count, 1));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}

/** A local calendar day as `YYYY-MM-DD`. */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The guest's local calendar day. Pass `now` in tests. */
export function localToday(now: Date = new Date()): string {
  return toIsoDate(now);
}

export function fromIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d); // local midnight, never new Date("YYYY-MM-DD")
}

export function formatDateRangeSummary(
  checkIn?: string,
  checkOut?: string,
): string {
  if (!checkIn || !checkOut) return "Any dates";
  const start = fromIsoDate(checkIn);
  const end = fromIsoDate(checkOut);
  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  });
  const withYear = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const startMonth = start.getMonth();
  const endMonth = end.getMonth();
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startYear !== endYear) {
    return `${withYear.format(start)} – ${withYear.format(end)}`;
  }
  if (startMonth !== endMonth) {
    return `${formatter.format(start)} – ${formatter.format(end)}`;
  }
  return `${formatter.format(start)} – ${end.getDate()}`;
}
