/**
 * Booking escrow configuration.
 *
 * Every value that changes what the guest pays or who receives the money is
 * read here, once. Components never hardcode fees, rates, or role addresses.
 *
 * `NEXT_PUBLIC_*` values must be read with literal `process.env.X` access so
 * Next.js can inline them at build time.
 */
import type { baseURL } from "@trustless-work/escrow";
import { trustlines } from "@/components/tw-blocks/wallet-kit/trustlines";

const parseNumber = (raw: string | undefined, fallback: number): number => {
  if (raw === undefined || raw.trim() === "") return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
};

/**
 * Platform fee as a percentage (e.g. 5 = 5 %). Sent to Trustless Work as the
 * escrow's `platformFee` and shown to the guest in the price breakdown.
 * Default matches the 5 % the booking UI has always displayed.
 */
export const PLATFORM_FEE_PERCENT = parseNumber(
  process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENT,
  5,
);

/** Tax rate as a fraction (0.1 = 10 %). 0 is a valid rate. */
export const BOOKING_TAX_RATE = parseNumber(
  process.env.NEXT_PUBLIC_BOOKING_TAX_RATE,
  0.1,
);

/** Owns the escrow and signs the release once the stay completes. */
export const getPlatformWalletAddress = (): string =>
  process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS?.trim() ?? "";

/** Resolves disputes between guest and host. */
export const getDisputeResolverAddress = (): string =>
  process.env.NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS?.trim() ?? "";

/** The wallet kit is pinned to testnet (see auth/wallet/constants/wallet-kit.constant.ts). */
export const STELLAR_NETWORK: "testnet" | "mainnet" = "testnet";

/**
 * Trustless Work API for STELLAR_NETWORK (the SDK's `baseURL` values).
 * Derived from the network, never from NODE_ENV: the API must build
 * transactions for the same network the wallet kit signs on.
 */
export const TRUSTLESS_WORK_API_URL: baseURL =
  STELLAR_NETWORK === "testnet"
    ? "https://dev.api.trustlesswork.com"
    : "https://api.trustlesswork.com";

/**
 * USDC trustline for the active network. Uses the classic issuer address,
 * the same normalization the tw-blocks initialize-escrow form applies to
 * Soroban (C...) trustline addresses.
 */
export const getUsdcTrustlineAddress = (): string => {
  const usdc = trustlines.find(
    (t) => t.name === "USDC" && t.network === STELLAR_NETWORK,
  );
  return usdc?.issuer ?? "";
};

export const stellarExpertTxUrl = (txHash: string): string =>
  `https://stellar.expert/explorer/${STELLAR_NETWORK}/tx/${txHash}`;

export const stellarExpertContractUrl = (contractId: string): string =>
  `https://stellar.expert/explorer/${STELLAR_NETWORK}/contract/${contractId}`;

/** How often a `*:submitted` step re-checks the indexer. */
export const SUBMITTED_POLL_INTERVAL_MS = 5_000;

/** How long a `*:submitted` step waits for the indexer before offering a retry. */
export const SUBMITTED_POLL_TIMEOUT_MS = 2 * 60_000;
