/**
 * Booking price breakdown: the single source of truth for what the guest pays.
 *
 * The `total` returned here is the number shown to the guest, the escrow
 * `amount` deployed on Stellar, and the amount funded into it. Everything is
 * computed in integer cents so the three can never drift by a rounding error.
 */
import { BOOKING_TAX_RATE, PLATFORM_FEE_PERCENT } from "./config";

export interface BookingPriceBreakdown {
  nightlyRate: number;
  nights: number;
  guests: number;
  /** nightlyRate × nights × guests */
  subtotal: number;
  /** Fraction, e.g. 0.1 */
  taxRate: number;
  tax: number;
  /** Percentage, e.g. 5 */
  platformFeePercent: number;
  platformFee: number;
  /** subtotal + tax + platformFee. This is the escrow amount. */
  total: number;
}

interface ComputeBookingPriceInput {
  nightlyRate: number;
  nights: number;
  guests: number;
  taxRate?: number;
  platformFeePercent?: number;
}

const toCents = (value: number): number => Math.round(value * 100);
const fromCents = (cents: number): number => cents / 100;

export function computeBookingPrice({
  nightlyRate,
  nights,
  guests,
  taxRate = BOOKING_TAX_RATE,
  platformFeePercent = PLATFORM_FEE_PERCENT,
}: ComputeBookingPriceInput): BookingPriceBreakdown {
  const safeNights =
    Number.isFinite(nights) && nights > 0 ? Math.floor(nights) : 0;
  const safeGuests =
    Number.isFinite(guests) && guests > 0 ? Math.floor(guests) : 0;
  // A missing or bad listing price must never become a NaN or negative escrow
  // amount; a zero rate is rejected later by validateEscrowSetup.
  const safeRate =
    Number.isFinite(nightlyRate) && nightlyRate > 0 ? nightlyRate : 0;

  const subtotalCents = toCents(safeRate) * safeNights * safeGuests;
  const taxCents = Math.round(subtotalCents * taxRate);
  const platformFeeCents = Math.round(
    (subtotalCents * platformFeePercent) / 100,
  );
  const totalCents = subtotalCents + taxCents + platformFeeCents;

  return {
    nightlyRate: safeRate,
    nights: safeNights,
    guests: safeGuests,
    subtotal: fromCents(subtotalCents),
    taxRate,
    tax: fromCents(taxCents),
    platformFeePercent,
    platformFee: fromCents(platformFeeCents),
    total: fromCents(totalCents),
  };
}

/** Whole nights between two calendar dates (time of day ignored). */
export function countNights(checkIn: Date, checkOut: Date): number {
  const start = Date.UTC(
    checkIn.getFullYear(),
    checkIn.getMonth(),
    checkIn.getDate(),
  );
  const end = Date.UTC(
    checkOut.getFullYear(),
    checkOut.getMonth(),
    checkOut.getDate(),
  );
  return Math.round((end - start) / 86_400_000);
}

/** Same amount, compared at cent precision. */
export const sameAmount = (a: number, b: number): boolean =>
  toCents(a) === toCents(b);
