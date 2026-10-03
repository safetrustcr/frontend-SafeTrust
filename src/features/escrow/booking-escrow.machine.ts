/**
 * Booking escrow state machine (issue #546).
 *
 * Pure logic only: types, persistence, reconciliation, and the rules that
 * decide the next on-chain action. React wiring lives in `useBookingEscrow.ts`.
 *
 * Safety invariants enforced here:
 *  1. One booking → one engagementId (`engagementId === bookingId`).
 *  2. Never deploy while the indexer shows an escrow for the engagementId.
 *  3. Never fund when the escrow balance already covers `intent.amount`.
 *  4. Never act on an escrow whose on-chain amount differs from the intent.
 *  5. An error after the signed transaction was handed to the network is
 *     "uncertain", never "failed": it is resolved by polling the indexer.
 */
import { StrKey } from "stellar-sdk";
import { format, parseISO } from "date-fns";
import type { InitializeSingleReleaseEscrowPayload } from "@trustless-work/escrow/types";
import {
  getDisputeResolverAddress,
  getPlatformWalletAddress,
  getUsdcTrustlineAddress,
  SUBMITTED_POLL_TIMEOUT_MS,
} from "./config";
import { sameAmount, type BookingPriceBreakdown } from "./pricing";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FailureReason =
  | "rejected"
  | "network"
  | "insufficient-funds"
  | "amount-mismatch"
  | "unknown";

export type BookingEscrowState =
  | { step: "idle" }
  | { step: "deploy:awaiting-signature" }
  | { step: "deploy:submitted"; txHash?: string; submittedAt: string }
  | { step: "deployed"; contractId: string }
  | { step: "fund:awaiting-signature"; contractId: string }
  | {
      step: "fund:submitted";
      contractId: string;
      txHash?: string;
      submittedAt: string;
    }
  | { step: "funded"; contractId: string }
  | {
      step: "failed";
      at: "deploy" | "fund";
      reason: FailureReason;
      contractId?: string;
      /** Hash of a submitted transaction whose outcome is uncertain. */
      txHash?: string;
    };

export type BookingEscrowStep = BookingEscrowState["step"];

/** What the guest is booking. Persisted so a refresh can show the same numbers. */
export interface BookingDetails {
  listingId: string;
  listingName: string;
  /** Host payout wallet. Empty string when the host has none. */
  hostAddress: string;
  /** yyyy-MM-dd */
  checkIn: string;
  /** yyyy-MM-dd */
  checkOut: string;
  price: BookingPriceBreakdown;
}

export interface BookingEscrowIntent {
  version: 1;
  bookingId: string;
  /** Always equal to bookingId: the idempotency key sent to Trustless Work. */
  engagementId: string;
  /** Single source of truth for deploy AND fund. Equals booking.price.total. */
  amount: number;
  /** Percentage expected by Trustless Work, from config. */
  platformFee: number;
  /** Wallet that signed the deploy. Reconcile always queries with it. */
  signer?: string;
  booking: BookingDetails;
  state: BookingEscrowState;
  updatedAt: string;
}

/** The subset of the Trustless Work indexer response reconcile relies on. */
export interface IndexedEscrow {
  engagementId: string;
  contractId?: string;
  amount?: number;
  balance?: number;
}

export interface ReconcileResult {
  state: BookingEscrowState;
  /** The escrow the indexer holds for this engagementId, if any. */
  escrow: IndexedEscrow | null;
}

export type NextAction = "deploy" | "fund" | "none";

export type TxPhase = "build" | "sign" | "submitted";

// ---------------------------------------------------------------------------
// State helpers
// ---------------------------------------------------------------------------

const BUSY_STEPS: ReadonlySet<BookingEscrowStep> = new Set([
  "deploy:awaiting-signature",
  "deploy:submitted",
  "fund:awaiting-signature",
  "fund:submitted",
]);

/** Steps during which the booking button is disabled and leaving the page warns. */
export const isBusyState = (state: BookingEscrowState): boolean =>
  BUSY_STEPS.has(state.step);

export const isSubmittedState = (
  state: BookingEscrowState,
): state is Extract<
  BookingEscrowState,
  { step: "deploy:submitted" | "fund:submitted" }
> => state.step === "deploy:submitted" || state.step === "fund:submitted";

export const contractIdOf = (state: BookingEscrowState): string | undefined =>
  "contractId" in state ? state.contractId : undefined;

/**
 * A page reload kills any pending wallet prompt. The signed transaction is
 * only sent after `*:submitted` is persisted, so an `*:awaiting-signature`
 * step found in storage means nothing was sent from that prompt.
 */
export function recoverAfterReload(
  state: BookingEscrowState,
): BookingEscrowState {
  if (state.step === "deploy:awaiting-signature") return { step: "idle" };
  if (state.step === "fund:awaiting-signature") {
    return { step: "deployed", contractId: state.contractId };
  }
  return state;
}

// ---------------------------------------------------------------------------
// Persistence (sessionStorage, one key per booking)
// ---------------------------------------------------------------------------

export const intentKey = (bookingId: string) =>
  `safetrust.escrow-intent.${bookingId}`;

/** Points a listing at the booking the guest is currently paying for. */
export const activeBookingKey = (listingId: string) =>
  `safetrust.escrow-active-booking.${listingId}`;

const getStorage = (): Storage | null => {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch {
    return null;
  }
};

const isString = (v: unknown): v is string =>
  typeof v === "string" && v.length > 0;
const isNumber = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

function isValidState(value: unknown): value is BookingEscrowState {
  if (!value || typeof value !== "object") return false;
  const s = value as Record<string, unknown>;
  switch (s.step) {
    case "idle":
    case "deploy:awaiting-signature":
      return true;
    case "deploy:submitted":
      return isString(s.submittedAt);
    case "deployed":
    case "fund:awaiting-signature":
    case "funded":
      return isString(s.contractId);
    case "fund:submitted":
      return isString(s.contractId) && isString(s.submittedAt);
    case "failed":
      return (
        (s.at === "deploy" || s.at === "fund") &&
        [
          "rejected",
          "network",
          "insufficient-funds",
          "amount-mismatch",
          "unknown",
        ].includes(s.reason as string) &&
        (s.contractId === undefined || isString(s.contractId)) &&
        (s.txHash === undefined || isString(s.txHash))
      );
    default:
      return false;
  }
}

function isValidIntent(
  value: unknown,
  bookingId: string,
): value is BookingEscrowIntent {
  if (!value || typeof value !== "object") return false;
  const i = value as Record<string, unknown>;
  const booking = i.booking as Record<string, unknown> | undefined;
  const price = booking?.price as Record<string, unknown> | undefined;
  return (
    i.version === 1 &&
    i.bookingId === bookingId &&
    i.engagementId === bookingId &&
    isNumber(i.amount) &&
    i.amount > 0 &&
    isNumber(i.platformFee) &&
    (i.signer === undefined || isString(i.signer)) &&
    !!booking &&
    isString(booking.listingId) &&
    isString(booking.listingName) &&
    typeof booking.hostAddress === "string" &&
    isString(booking.checkIn) &&
    isString(booking.checkOut) &&
    !!price &&
    isNumber(price.total) &&
    sameAmount(price.total, i.amount as number) &&
    isValidState(i.state)
  );
}

/** Returns null (and drops the entry) when storage holds anything malformed. */
export function loadIntent(bookingId: string): BookingEscrowIntent | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(intentKey(bookingId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (isValidIntent(parsed, bookingId)) return parsed;
  } catch {
    // fall through: malformed JSON
  }
  try {
    storage.removeItem(intentKey(bookingId));
  } catch {
    // storage unavailable
  }
  return null;
}

export function saveIntent(intent: BookingEscrowIntent): BookingEscrowIntent {
  const next = { ...intent, updatedAt: new Date().toISOString() };
  try {
    getStorage()?.setItem(intentKey(intent.bookingId), JSON.stringify(next));
  } catch {
    // Quota or privacy mode: the in-memory copy still drives the UI and the
    // indexer reconcile still prevents duplicates.
  }
  return next;
}

export function clearIntent(bookingId: string): void {
  try {
    getStorage()?.removeItem(intentKey(bookingId));
  } catch {
    // storage unavailable
  }
}

/**
 * Read-only record of a funded booking. The intent itself is cleared on
 * `funded`; the receipt lets the payment page show "confirmed" for it.
 */
export const receiptKey = (bookingId: string) =>
  `safetrust.escrow-receipt.${bookingId}`;

export function saveReceipt(intent: BookingEscrowIntent): void {
  if (intent.state.step !== "funded") return;
  try {
    getStorage()?.setItem(receiptKey(intent.bookingId), JSON.stringify(intent));
  } catch {
    // storage unavailable
  }
}

export function loadReceipt(bookingId: string): BookingEscrowIntent | null {
  try {
    const raw = getStorage()?.getItem(receiptKey(bookingId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValidIntent(parsed, bookingId) && parsed.state.step === "funded"
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export function loadActiveBookingId(listingId: string): string | null {
  try {
    const value = getStorage()?.getItem(activeBookingKey(listingId));
    return value && value.trim() ? value : null;
  } catch {
    return null;
  }
}

export function saveActiveBookingId(
  listingId: string,
  bookingId: string,
): void {
  try {
    getStorage()?.setItem(activeBookingKey(listingId), bookingId);
  } catch {
    // storage unavailable
  }
}

export function clearActiveBookingId(listingId: string): void {
  try {
    getStorage()?.removeItem(activeBookingKey(listingId));
  } catch {
    // storage unavailable
  }
}

export function newBookingId(): string {
  const cryptoApi =
    typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (cryptoApi && typeof cryptoApi.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }
  return `bk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createIntent(
  bookingId: string,
  booking: BookingDetails,
): BookingEscrowIntent {
  return {
    version: 1,
    bookingId,
    engagementId: bookingId,
    amount: booking.price.total,
    platformFee: booking.price.platformFeePercent,
    booking,
    state: { step: "idle" },
    updatedAt: new Date().toISOString(),
  };
}

/** Two drafts describe the same booking (dates, listing, and exact amount). */
export const sameBooking = (a: BookingDetails, b: BookingDetails): boolean =>
  a.listingId === b.listingId &&
  a.checkIn === b.checkIn &&
  a.checkOut === b.checkOut &&
  a.hostAddress === b.hostAddress &&
  sameAmount(a.price.total, b.price.total);

// ---------------------------------------------------------------------------
// Reconciliation against the Trustless Work indexer
// ---------------------------------------------------------------------------

const covers = (balance: number | undefined, amount: number) =>
  Math.round((balance ?? 0) * 100) >= Math.round(amount * 100);

/**
 * Derive the real state of a booking from the indexer's escrows.
 * Pure: the caller fetches `escrows` (see `useBookingEscrow`).
 *
 * `previousState` is the state being reconciled from. When it is an
 * unresolved fund failure, the fundable `deployed` state is never returned:
 * the submitted transaction may still land while the indexer lags, and a
 * second fund would double-charge the guest. The caller must resolve the
 * uncertainty first (see `resolveSubmitted` and the txHash probe).
 */
export function reconcile(
  intent: BookingEscrowIntent,
  escrows: IndexedEscrow[],
  previousState?: BookingEscrowState,
): ReconcileResult {
  const matches = escrows.filter((e) => e.engagementId === intent.engagementId);

  if (matches.length === 0) {
    // Only the pre-escrow steps ("deploy:*") fall back to idle. Note that
    // "deployed".startsWith("deploy") is true: matching the bare prefix would
    // turn a deployed booking into idle whenever the indexer lags, and the
    // next click would deploy a second escrow.
    return {
      state: intent.state.step.startsWith("deploy:")
        ? { step: "idle" }
        : intent.state,
      escrow: null,
    };
  }

  // Legacy duplicates are possible: prefer the one that is already funded.
  const escrow =
    matches.find((e) => covers(e.balance, intent.amount)) ?? matches[0];

  // An unresolved fund stays non-fundable even though the indexer answers
  // and the balance is still short: the transaction may not have landed yet.
  // Only a submitted transaction (we hold its hash) is uncertain; a network
  // error before the send left nothing on-chain and stays retryable.
  const unresolvedFund =
    previousState?.step === "failed" &&
    previousState.at === "fund" &&
    previousState.reason === "network" &&
    isString(previousState.txHash)
      ? previousState
      : null;

  if (!escrow.contractId) {
    // It exists but we cannot address it. Never deploy; ask to check again.
    // An unresolved fund keeps its marker: the fund tx outcome is still
    // unknown, and mislabeling it as a deploy failure would block recovery.
    if (unresolvedFund) {
      return { state: unresolvedFund, escrow };
    }
    return {
      state: { step: "failed", at: "deploy", reason: "network" },
      escrow,
    };
  }

  if (
    escrow.amount !== undefined &&
    !sameAmount(escrow.amount, intent.amount)
  ) {
    return {
      state: {
        step: "failed",
        at: "fund",
        reason: "amount-mismatch",
        contractId: escrow.contractId,
      },
      escrow,
    };
  }

  if (covers(escrow.balance, intent.amount)) {
    return { state: { step: "funded", contractId: escrow.contractId }, escrow };
  }

  if (unresolvedFund) {
    return {
      state: { ...unresolvedFund, contractId: escrow.contractId },
      escrow,
    };
  }

  return { state: { step: "deployed", contractId: escrow.contractId }, escrow };
}

/**
 * For a `*:submitted` step, decide whether the indexer has confirmed the
 * outcome yet. Until it has (and before the deadline) the step is kept, so
 * the UI keeps showing "Confirming on Stellar…" and offers no retry.
 */
export function resolveSubmitted(
  previous: Extract<
    BookingEscrowState,
    { step: "deploy:submitted" | "fund:submitted" }
  >,
  /** null when the indexer could not be reached on this attempt. */
  result: ReconcileResult | null,
  now: number,
  timeoutMs: number = SUBMITTED_POLL_TIMEOUT_MS,
): BookingEscrowState {
  if (result) {
    const confirmed =
      previous.step === "deploy:submitted"
        ? result.escrow !== null
        : result.state.step === "funded" ||
          (result.state.step === "failed" &&
            result.state.reason === "amount-mismatch");
    if (confirmed) return result.state;
  }

  const submittedAt = Date.parse(previous.submittedAt);
  const deadline = (Number.isFinite(submittedAt) ? submittedAt : 0) + timeoutMs;
  if (now < deadline) return previous;

  // Past the deadline the transaction has expired or failed.
  if (previous.step === "fund:submitted") {
    // The tx outcome is unknown: it may still land while the indexer lags,
    // so never return the fundable "deployed" state here — that would let
    // a retry fund a second time. Stay non-fundable until the escrow is
    // provably funded (handled above) or the tx has a definitive outcome.
    // The hash is kept so the caller can ask the indexer for that outcome.
    return {
      step: "failed",
      at: "fund",
      reason: "network",
      contractId: previous.contractId,
      txHash: previous.txHash,
    };
  }
  return {
    step: "failed",
    at: "deploy",
    reason: "network",
    txHash: previous.txHash,
  };
}

/**
 * Starting over (new bookingId) is only offered when no money can be in the
 * escrow: nothing deployed, or deployed but provably unfunded.
 */
export function canDiscard(state: BookingEscrowState): boolean {
  switch (state.step) {
    case "idle":
    case "deployed":
      return true;
    case "failed":
      return (
        state.reason !== "amount-mismatch" &&
        (state.at === "deploy" || state.reason !== "network")
      );
    default:
      return false;
  }
}

/** A draft can be swapped for new dates/amount only before any escrow exists. */
export const canReplaceBooking = (state: BookingEscrowState): boolean =>
  state.step === "idle" || (state.step === "failed" && state.at === "deploy");

/**
 * Decide the only on-chain action allowed next. `justDeployed` is true only
 * inside the same run that just received a contractId from a successful
 * deploy, when the indexer may not have caught up yet.
 */
export function planNextAction(
  result: ReconcileResult,
  { justDeployed = false }: { justDeployed?: boolean } = {},
): NextAction {
  const { state, escrow } = result;

  if (state.step === "funded" || isBusyState(state)) return "none";

  if (escrow) {
    // An escrow exists for this booking: deploying again is never allowed.
    if (!escrow.contractId) return "none";
    if (state.step === "failed" && state.reason === "amount-mismatch")
      return "none";
    return state.step === "deployed" ? "fund" : "none";
  }

  // The indexer does not show an escrow.
  if (contractIdOf(state)) {
    // We hold a contractId the indexer has not confirmed. Funding is only
    // safe right after our own deploy, when no fund can have been sent yet.
    return justDeployed && state.step === "deployed" ? "fund" : "none";
  }

  return state.step === "idle" ||
    (state.step === "failed" && state.at === "deploy")
    ? "deploy"
    : "none";
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export function errorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const e = error as {
      response?: { data?: { message?: unknown } };
      message?: unknown;
    };
    const apiMessage = e.response?.data?.message;
    if (typeof apiMessage === "string" && apiMessage) return apiMessage;
    if (typeof e.message === "string" && e.message) return e.message;
  }
  return typeof error === "string" ? error : "Unknown error";
}

/**
 * Classify by WHERE the error happened, not by its text:
 *  - "sign": the wallet threw or the user cancelled. Nothing was sent.
 *  - "build": the API refused to build the transaction. Nothing was sent.
 *  - "submitted": the signed tx may have landed. Returns null: the caller
 *    must keep `*:submitted` and reconcile, never report a failure.
 */
export function classifyTxError(
  phase: TxPhase,
  error: unknown,
): FailureReason | null {
  if (phase === "submitted") return null;
  if (phase === "sign") return "rejected";

  const message = errorMessage(error).toLowerCase();
  if (
    /insufficient|underfunded|not enough|balance too low|trustline/.test(
      message,
    )
  ) {
    return "insufficient-funds";
  }
  const code = (error as { code?: unknown } | null)?.code;
  if (
    code === "ERR_NETWORK" ||
    code === "ECONNABORTED" ||
    /network|timeout|timed out|connection/.test(message)
  ) {
    return "network";
  }
  return "unknown";
}

// ---------------------------------------------------------------------------
// Validation and payload
// ---------------------------------------------------------------------------

export const isStellarPublicKey = (
  value: string | null | undefined,
): boolean => {
  if (!value) return false;
  try {
    return StrKey.isValidEd25519PublicKey(value);
  } catch {
    return false;
  }
};

export const MISSING_HOST_WALLET_MESSAGE =
  "This host hasn't added a payout wallet yet, so this stay can't be booked with escrow. Please contact the host or choose another stay.";

/**
 * Everything that must hold before the first wallet prompt. Returns
 * human-readable problems; an empty array means the escrow can be deployed.
 */
export function validateEscrowSetup(
  booking: BookingDetails,
  guestAddress: string | null | undefined,
): string[] {
  const errors: string[] = [];
  const { price } = booking;

  if (!isStellarPublicKey(guestAddress)) {
    errors.push("Connect a Stellar wallet to book.");
  }
  if (!booking.hostAddress) {
    errors.push(MISSING_HOST_WALLET_MESSAGE);
  } else if (!isStellarPublicKey(booking.hostAddress)) {
    errors.push(
      "The host's payout wallet address is not a valid Stellar public key.",
    );
  }
  if (!isStellarPublicKey(getPlatformWalletAddress())) {
    errors.push(
      "Escrow is not configured: NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS must be a valid Stellar public key.",
    );
  }
  if (!isStellarPublicKey(getDisputeResolverAddress())) {
    errors.push(
      "Escrow is not configured: NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS must be a valid Stellar public key.",
    );
  }
  if (!getUsdcTrustlineAddress()) {
    errors.push(
      "Escrow is not configured: no USDC trustline for this network.",
    );
  }
  if (price.nights < 1) errors.push("Select at least one night.");
  if (!(Number.isFinite(price.subtotal) && price.subtotal > 0)) {
    errors.push("The price must be greater than zero.");
  }
  if (!(Number.isFinite(price.tax) && price.tax >= 0)) {
    errors.push("Tax must be zero or more.");
  }
  if (!(Number.isFinite(price.platformFee) && price.platformFee >= 0)) {
    errors.push("The platform fee must be zero or more.");
  }
  if (
    !sameAmount(price.total, price.subtotal + price.tax + price.platformFee)
  ) {
    errors.push("The price breakdown does not add up to the total.");
  }
  const checkIn = parseISO(booking.checkIn);
  const checkOut = parseISO(booking.checkOut);
  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    errors.push("Select valid check-in and check-out dates.");
  } else if (checkOut <= checkIn) {
    errors.push("Check-out must be after check-in.");
  }

  return errors;
}

/** Single-release escrow for one stay. Every role comes from data or config. */
export function buildDeployPayload(
  intent: BookingEscrowIntent,
  guestAddress: string,
): InitializeSingleReleaseEscrowPayload {
  const { booking } = intent;
  const nights = booking.price.nights;
  const platform = getPlatformWalletAddress();

  return {
    engagementId: intent.engagementId,
    title: `${booking.listingName}: ${nights} night${nights > 1 ? "s" : ""}`,
    description: `Stay ${format(parseISO(booking.checkIn), "PP")} → ${format(
      parseISO(booking.checkOut),
      "PP",
    )}`,
    amount: intent.amount,
    platformFee: intent.platformFee,
    signer: guestAddress,
    roles: {
      approver: guestAddress,
      serviceProvider: booking.hostAddress,
      platformAddress: platform,
      releaseSigner: platform,
      disputeResolver: getDisputeResolverAddress(),
      receiver: booking.hostAddress,
    },
    milestones: [{ description: "Stay completed without disputes" }],
    trustline: { address: getUsdcTrustlineAddress() },
  };
}
