const pad = (n: number) => String(n).padStart(2, "0");
const parts = (iso: string) =>
  iso.split("-").map(Number) as [number, number, number];

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = parts(value);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

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

/** The guest's local calendar day. Pass `now` in tests. */
export function localToday(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
