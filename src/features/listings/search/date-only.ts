/**
 * Calendar dates as local-timezone `YYYY-MM-DD` strings.
 *
 * Strings of this shape compare correctly with `<`/`>`, which the stay
 * matchers rely on. Day arithmetic goes through UTC so a local DST shift
 * can never move a night across a calendar day.
 */
export type IsoDate = string;

const pad = (value: number) => String(value).padStart(2, "0");

/** Format a Date as the guest's local calendar day (never UTC: that can be "tomorrow"). */
export function localToday(now: Date = new Date()): IsoDate {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Shift a calendar day by `days` (may be negative) without DST drift. */
export function addDays(date: IsoDate, days: number): IsoDate {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(
    shifted.getUTCDate(),
  )}`;
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** True for `YYYY-MM-DD` strings that name a real calendar day. */
export function isIsoDate(value: string): value is IsoDate {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}
