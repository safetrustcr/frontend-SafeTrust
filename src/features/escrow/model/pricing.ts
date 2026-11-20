/**
 * Booking price breakdown: the single source of truth for what the guest pays.
 *
 * The `total` returned here is the number shown to the guest, the escrow
 * `amount` deployed on Stellar, and the amount funded into it. Everything is
 * computed in integer cents so the three can never drift by a rounding error.
 *
 * ## Fee transparency (Issue #756)
 *
 * Trustless Work deducts fees **at release**, not at deposit. Two fee options
 * are supported, switchable by `FEE_OPTION` in config.ts:
 *
 * - **"guest"** (Option A): The deposit is grossed up so the host receives
 *   exactly `stay + tax` after all fees come off at release.
 *
 * - **"host"** (Option B): The guest deposits `stay + tax`; Trustless Work and
 *   the platform fee come out of the host's payout at release.
 *
 * The 0.3 % Trustless Work protocol fee is included in the math only on
 * mainnet (`NEXT_PUBLIC_TRUSTLESS_NETWORK=mainnet`).
 */
import {
  BOOKING_TAX_RATE,
  FEE_OPTION,
  type FeeOption,
  PLATFORM_FEE_PERCENT,
} from "../config";
import { STELLAR_NETWORK_NAME } from "@/lib/stellar/network";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Trustless Work protocol fee (0.3 %). Applied only on mainnet. */
export const TRUSTLESS_WORK_FEE_RATE = 0.003;

/** Whether the protocol fee is active on the current network. */
export const isMainnet = (): boolean => STELLAR_NETWORK_NAME === "mainnet";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type { FeeOption };

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
  /**
   * Option A: exact service-fee line (gross-up amount).
   * Option B: 0 — no service fee line shown to the guest.
   */
  platformFee: number;
  /** subtotal + tax + platformFee. This is the escrow amount. */
  total: number;
  /** Which fee option produced this breakdown. */
  feeOption: FeeOption;
  /**
   * What the host will receive when the escrow is released.
   * Equals `subtotal + tax` for Option A; `total × (1 − fees)` for Option B.
   */
  hostPayout: number;
  /**
   * The actual platform fee dollar amount deducted from the escrow at release.
   */
  effectivePlatformFee: number;
  /**
   * The 0.3 % Trustless Work protocol fee deducted from the escrow at release.
   * Zero on testnet.
   */
  trustlessWorkFee: number;
  /** True when the protocol fee is included in the calculation. */
  includesProtocolFee: boolean;
}

export interface ComputeBookingPriceInput {
  nightlyRate: number;
  nights: number;
  guests: number;
  /** Preserve exact proration for fixed-period rental prices. */
  subtotalOverride?: number;
  taxRate?: number;
  platformFeePercent?: number;
  feeOption?: FeeOption;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const toCents = (value: number): number => Math.round(value * 100);
const fromCents = (cents: number): number => cents / 100;

// ---------------------------------------------------------------------------
// Core function
// ---------------------------------------------------------------------------

export function computeBookingPrice({
  nightlyRate,
  nights,
  guests,
  subtotalOverride,
  taxRate = BOOKING_TAX_RATE,
  platformFeePercent = PLATFORM_FEE_PERCENT,
  feeOption = FEE_OPTION,
}: ComputeBookingPriceInput): BookingPriceBreakdown {
  const safeNights =
    Number.isFinite(nights) && nights > 0 ? Math.floor(nights) : 0;
  const safeGuests =
    Number.isFinite(guests) && guests > 0 ? Math.floor(guests) : 0;
  // A missing or bad listing price must never become a NaN or negative escrow
  // amount; a zero rate is rejected later by validateEscrowSetup.
  const safeRate =
    Number.isFinite(nightlyRate) && nightlyRate > 0 ? nightlyRate : 0;
  const safeSubtotalOverride =
    typeof subtotalOverride === "number" &&
    Number.isFinite(subtotalOverride) &&
    subtotalOverride >= 0
      ? subtotalOverride
      : null;

  const subtotalCents =
    safeSubtotalOverride !== null
      ? toCents(safeSubtotalOverride)
      : toCents(safeRate) * safeNights * safeGuests;
  const taxCents = Math.round(subtotalCents * taxRate);

  // Platform fee as a fraction (e.g. 5% -> 0.05)
  const platformFeeRate = platformFeePercent / 100;

  // Protocol fee: 0.3 % on mainnet, 0 on testnet
  const includesProtocolFee = isMainnet();
  const protocolFeeRate = includesProtocolFee ? TRUSTLESS_WORK_FEE_RATE : 0;
  const totalFeeRate = platformFeeRate + protocolFeeRate;

  // base = subtotal + tax (what the host expects / receives under Option A)
  const baseCents = subtotalCents + taxCents;

  let totalCents: number;
  let serviceFeeDisplayCents: number;
  let effectivePlatformFeeCents: number;
  let trustlessWorkFeeCents: number;
  let hostPayoutCents: number;

  if (feeOption === "guest") {
    // Option A: gross-up so the host receives exactly baseCents after fees at
    // release. Each fee is rounded independently at release, so we derive
    // hostPayout from the actual rounded deductions rather than setting it to
    // baseCents directly. This ensures deposit - platformFee - trustlessWorkFee
    // === hostPayout on the displayed breakdown.
    const divisor = totalFeeRate < 1 ? 1 - totalFeeRate : 1;
    totalCents = Math.round(baseCents / divisor);
    effectivePlatformFeeCents = Math.round(
      (totalCents * platformFeePercent) / 100,
    );
    trustlessWorkFeeCents = Math.round(totalCents * protocolFeeRate);
    serviceFeeDisplayCents = totalCents - baseCents;
    // Derive payout from the same rounded deductions so the breakdown adds up:
    // deposit − platformFee − trustlessWorkFee === hostPayout (to the cent).
    hostPayoutCents =
      totalCents - effectivePlatformFeeCents - trustlessWorkFeeCents;
  } else {
    // Option B: guest deposits base; fees come out of host payout at release
    totalCents = baseCents;
    effectivePlatformFeeCents = Math.round(
      (totalCents * platformFeePercent) / 100,
    );
    trustlessWorkFeeCents = Math.round(totalCents * protocolFeeRate);
    serviceFeeDisplayCents = 0;
    hostPayoutCents =
      totalCents - effectivePlatformFeeCents - trustlessWorkFeeCents;
  }

  return {
    nightlyRate: safeRate,
    nights: safeNights,
    guests: safeGuests,
    subtotal: fromCents(subtotalCents),
    taxRate,
    tax: fromCents(taxCents),
    platformFeePercent,
    platformFee: fromCents(serviceFeeDisplayCents),
    total: fromCents(totalCents),
    feeOption,
    hostPayout: fromCents(hostPayoutCents),
    effectivePlatformFee: fromCents(effectivePlatformFeeCents),
    trustlessWorkFee: fromCents(trustlessWorkFeeCents),
    includesProtocolFee,
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
