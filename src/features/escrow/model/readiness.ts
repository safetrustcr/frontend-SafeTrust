/**
 * Wallet readiness before a booking escrow is signed (#762).
 *
 * Every wallet that receives money from the escrow needs a USDC trustline:
 * the host (receiver) and the platform wallet (fees). The guest needs one too,
 * plus enough USDC to fund. This module only describes those checks for the
 * UI; running them against Horizon is a separate issue, so every component
 * here is driven by these props.
 */
import { DEMO_MODE } from "@/lib/demo";
import { formatAmount } from "@/lib/format";

/** A wallet that only has to receive USDC (host, platform). */
export type PartyReadiness =
  | { status: "checking" }
  | { status: "ready" }
  | { status: "no-trustline" }
  | { status: "error" };

/** The guest also has to hold enough USDC to fund the escrow. */
export type GuestReadiness =
  | PartyReadiness
  | { status: "insufficient-balance"; required: number; available: number };

export interface CheckoutReadiness {
  guest: GuestReadiness;
  host: PartyReadiness;
  platform: PartyReadiness;
}

export type ReadinessKey = keyof CheckoutReadiness;

/**
 * Overall state of the checklist. A definite failure wins over an unknown
 * one, so the guest sees what to fix even while another check is retrying.
 */
export type ReadinessSummary = "checking" | "ready" | "not-ready" | "error";

const isFailure = (item: GuestReadiness) =>
  item.status === "no-trustline" || item.status === "insufficient-balance";

export const READINESS_KEYS: readonly ReadinessKey[] = [
  "guest",
  "host",
  "platform",
];

export function summarizeReadiness(
  readiness: CheckoutReadiness,
): ReadinessSummary {
  const items = READINESS_KEYS.map((key) => readiness[key]);
  if (items.some(isFailure)) return "not-ready";
  if (items.some((item) => item.status === "error")) return "error";
  if (items.some((item) => item.status === "checking")) return "checking";
  return "ready";
}

export const READINESS_LABELS: Record<ReadinessKey, string> = {
  guest: "Your wallet",
  host: "Host can receive USDC",
  platform: "Platform can receive fees",
};

/** One line per item, so the reason never depends on colour or icon alone. */
export function describeReadinessItem(
  key: ReadinessKey,
  item: GuestReadiness,
): string {
  switch (item.status) {
    case "checking":
      return "Checking…";
    case "error":
      return "We couldn't check this. Try again.";
    case "ready":
      return key === "guest"
        ? "USDC trustline added and enough USDC to pay."
        : key === "host"
          ? "The host's wallet can receive USDC."
          : "SafeTrust's fee wallet can receive USDC.";
    case "insufficient-balance":
      return `You need ${formatAmount(item.required)} USDC, you have ${formatAmount(item.available)}.`;
    case "no-trustline":
      return key === "guest"
        ? "Your wallet has no USDC trustline yet."
        : key === "host"
          ? "The host hasn't added a USDC trustline, so they can't be paid yet."
          : "SafeTrust's fee wallet can't receive USDC right now. Please try again later.";
  }
}

/** Host-side status for the payout banner and the listings table. */
export type HostPayoutStatus =
  "unknown" | "checking" | "ready" | "not-ready" | "error";

// ---- demo presets ------------------------------------------------------------
// Demo mode (NEXT_PUBLIC_DEMO_MODE) can force a checklist state with
// `?readiness=<preset>` on /rent/[id]/book, so every state can be reviewed and
// screenshotted before the real checks land.

export const DEMO_READINESS_PRESETS = [
  "ready",
  "checking",
  "guest-no-trustline",
  "guest-low-balance",
  "host-not-ready",
  "error",
] as const;

export type DemoReadinessPreset = (typeof DEMO_READINESS_PRESETS)[number];

const isDemoReadinessPreset = (
  value: string | undefined,
): value is DemoReadinessPreset =>
  (DEMO_READINESS_PRESETS as readonly string[]).includes(value ?? "");

/** The `?readiness=` preset, honoured only in demo mode. */
export const demoReadinessFromQuery = (
  value: string | undefined,
): DemoReadinessPreset | undefined =>
  DEMO_MODE && isDemoReadinessPreset(value) ? value : undefined;

/** The demo guest always holds $50.00 USDC when the balance is too low. */
const DEMO_GUEST_BALANCE = 50;

export function demoCheckoutReadiness(
  preset: DemoReadinessPreset,
  required: number,
): CheckoutReadiness {
  const ready = { status: "ready" } as const;
  switch (preset) {
    case "ready":
      return { guest: ready, host: ready, platform: ready };
    case "checking":
      return {
        guest: { status: "checking" },
        host: { status: "checking" },
        platform: { status: "checking" },
      };
    case "guest-no-trustline":
      return {
        guest: { status: "no-trustline" },
        host: ready,
        platform: ready,
      };
    case "guest-low-balance":
      return {
        guest: {
          status: "insufficient-balance",
          required,
          available: DEMO_GUEST_BALANCE,
        },
        host: ready,
        platform: ready,
      };
    case "host-not-ready":
      return {
        guest: ready,
        host: { status: "no-trustline" },
        platform: ready,
      };
    case "error":
      return { guest: ready, host: { status: "error" }, platform: ready };
  }
}
