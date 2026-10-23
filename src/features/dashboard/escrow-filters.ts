import type { EscrowData, EscrowStatus } from "@/types/dashboard";

export type EscrowSort = "recent" | "amount-high" | "amount-low" | "checkin";

export interface EscrowFilters {
  statuses: EscrowStatus[];
  minAmount: number | null;
  maxAmount: number | null;
  checkIn: { from: string | null; to: string | null }; // "YYYY-MM-DD", inclusive, local calendar days
  checkOut: { from: string | null; to: string | null };
  sort: EscrowSort;
}

export const EMPTY_FILTERS: EscrowFilters = {
  statuses: [],
  minAmount: null,
  maxAmount: null,
  checkIn: { from: null, to: null },
  checkOut: { from: null, to: null },
  sort: "recent",
};

export const STATUS_FILTER_OPTIONS: { value: EscrowStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "funded", label: "Funded" },
  { value: "check_in_approved", label: "Check-in approved" },
  { value: "check_out_approved", label: "Check-out approved" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

/** Compare calendar days, not instants: "to" includes the whole day. */
const dayOf = (iso: string) => iso.slice(0, 10);

const inRange = (
  iso: string | undefined,
  r: { from: string | null; to: string | null },
) =>
  (!r.from && !r.to) ||
  (!!iso &&
    (!r.from || dayOf(iso) >= r.from) &&
    (!r.to || dayOf(iso) <= r.to));

/** An amount range is invalid when both bounds are set and min > max. */
export const isAmountRangeValid = (f: Pick<EscrowFilters, "minAmount" | "maxAmount">) =>
  f.minAmount === null || f.maxAmount === null || f.minAmount <= f.maxAmount;

export function applyEscrowFilters(
  escrows: readonly EscrowData[],
  f: EscrowFilters,
): EscrowData[] {
  // Invalid range: show a field error in the UI and do not filter by amount.
  const amountActive = isAmountRangeValid(f);

  const result = escrows.filter(
    (e) =>
      (f.statuses.length === 0 || f.statuses.includes(e.status)) &&
      (!amountActive ||
        ((f.minAmount === null || e.amount >= f.minAmount) &&
          (f.maxAmount === null || e.amount <= f.maxAmount))) &&
      inRange(e.metadata?.checkInDate, f.checkIn) &&
      inRange(e.metadata?.checkOutDate, f.checkOut),
  );

  const time = (iso?: string) => (iso ? Date.parse(iso) || 0 : 0);
  const sorters: Record<EscrowSort, (a: EscrowData, b: EscrowData) => number> = {
    recent: (a, b) => time(b.createdAt) - time(a.createdAt),
    "amount-high": (a, b) => b.amount - a.amount,
    "amount-low": (a, b) => a.amount - b.amount,
    checkin: (a, b) => time(a.metadata?.checkInDate) - time(b.metadata?.checkInDate),
  };
  return [...result].sort(sorters[f.sort]);
}

/** Number of active filters. Sort is not a filter and is excluded. */
export const countActiveFilters = (f: EscrowFilters) =>
  f.statuses.length +
  Number(f.minAmount !== null) +
  Number(f.maxAmount !== null) +
  Number(!!f.checkIn.from) +
  Number(!!f.checkIn.to) +
  Number(!!f.checkOut.from) +
  Number(!!f.checkOut.to);

export const ACTIVE_STATUSES: EscrowStatus[] = [
  "pending",
  "funded",
  "check_in_approved",
  "check_out_approved",
];

/** Totals per asset. Never add different assets together. */
export function totalsByAsset(
  escrows: readonly EscrowData[],
): { asset: string; amount: number }[] {
  const m = new Map<string, number>();
  for (const e of escrows) {
    m.set(e.asset.code, (m.get(e.asset.code) ?? 0) + e.amount);
  }
  return [...m].map(([asset, amount]) => ({ asset, amount }));
}
