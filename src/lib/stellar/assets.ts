/**
 * Stellar assets SafeTrust can hold in escrow: the single source of truth.
 *
 * Every entry names the official page its identifiers were checked against.
 * Never add an entry, issuer or contract id that is not on such a page: an
 * asset from the wrong network makes every escrow on it fail (or worse).
 *
 * `issuer` is the classic account (G…) that issues the asset; `contractId` is
 * its Stellar Asset Contract on Soroban (C…). They are different identifiers.
 */

export type StellarNetworkName = "testnet" | "mainnet";

export interface StellarAsset {
  code: string;
  network: StellarNetworkName;
  /** Classic issuer account, `G…`. */
  issuer: string;
  /** Stellar Asset Contract (SEP-41) id, `C…`, when it is documented. */
  contractId?: string;
  /** Units per whole token: Stellar amounts have 7 decimal places. */
  scale: 10_000_000;
  /** Official page listing this asset's identifiers. */
  source: string;
}

const STELLAR_X402_DOCS =
  "https://developers.stellar.org/docs/build/agentic-payments/x402";

export const STELLAR_ASSETS: readonly StellarAsset[] = Object.freeze([
  {
    code: "USDC",
    network: "testnet",
    issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    contractId: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
    scale: 10_000_000,
    source: `${STELLAR_X402_DOCS}#testnet-usdc`,
  },
  {
    code: "USDC",
    network: "mainnet",
    issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    contractId: "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75",
    scale: 10_000_000,
    source: `${STELLAR_X402_DOCS}#mainnet-usdc`,
  },
  {
    // Circle's EURC. No SAC id is documented on the source page, so none is
    // listed. There is no testnet entry: its issuer could not be checked
    // against an official page.
    code: "EURC",
    network: "mainnet",
    issuer: "GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2",
    scale: 10_000_000,
    source: "https://developers.stellar.org/docs/tokens/anatomy-of-an-asset",
  },
]);

/** Classic Stellar account id (StrKey `G…`, 56 characters). */
export const STELLAR_ISSUER_PATTERN = /^G[A-Z2-7]{55}$/;
/** Soroban contract id (StrKey `C…`, 56 characters). */
export const STELLAR_CONTRACT_PATTERN = /^C[A-Z2-7]{55}$/;

export const assetsFor = (network: StellarNetworkName): StellarAsset[] =>
  STELLAR_ASSETS.filter((asset) => asset.network === network);

/**
 * USDC on `network`, or `null` when that network has none.
 *
 * A well-formed `issuerOverride` (e.g. `NEXT_PUBLIC_USDC_ISSUER`) replaces the
 * issuer only; the contract id is left as documented. A malformed override is
 * ignored rather than sent to the wallet.
 */
export function usdcFor(
  network: StellarNetworkName,
  issuerOverride?: string,
): StellarAsset | null {
  const usdc = assetsFor(network).find((asset) => asset.code === "USDC");
  if (!usdc) return null;
  const override = issuerOverride?.trim();
  return override && STELLAR_ISSUER_PATTERN.test(override)
    ? { ...usdc, issuer: override }
    : usdc;
}

/** Shown before any wallet prompt when the network has no usable USDC. */
export const usdcNotConfiguredMessage = (network: StellarNetworkName) =>
  `USDC isn't configured for ${network}. Contact support.`;

/**
 * Why `issuerOverride` looks like a configuration mistake for `network`, or
 * `null` when it is unset or matches the documented issuer. A valid override
 * that differs is still honored; this only explains it.
 */
export function usdcIssuerOverrideWarning(
  network: StellarNetworkName,
  issuerOverride: string | undefined,
): string | null {
  const override = issuerOverride?.trim();
  if (!override) return null;
  if (!STELLAR_ISSUER_PATTERN.test(override)) {
    return `NEXT_PUBLIC_USDC_ISSUER is not a Stellar account id (G…); it is ignored on ${network}.`;
  }
  const expected = usdcFor(network)?.issuer;
  if (!expected || override === expected) return null;
  const otherNetwork = STELLAR_ASSETS.find(
    (asset) =>
      asset.code === "USDC" &&
      asset.network !== network &&
      asset.issuer === override,
  )?.network;
  return otherNetwork
    ? `NEXT_PUBLIC_USDC_ISSUER is the ${otherNetwork} USDC issuer, but the app runs on ${network} (expected ${expected}). Escrows will fail.`
    : `NEXT_PUBLIC_USDC_ISSUER differs from Circle's ${network} USDC issuer (expected ${expected}). Using the override.`;
}
