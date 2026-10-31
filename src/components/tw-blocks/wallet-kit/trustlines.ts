/**
 * Trustlines | Non-Native Tokens from Stellar
 *
 * Local modification: a thin adapter over the canonical asset list in
 * `src/lib/stellar/assets.ts`. It keeps the vendored option shape the
 * initialize-escrow forms use, for the active network only.
 *
 * `value` is the Soroban contract id (C...) when one is documented, otherwise
 * the classic issuer (G...); `issuer` is always the classic issuer. A valid
 * NEXT_PUBLIC_USDC_ISSUER replaces the USDC issuer, as in the booking checkout.
 */
import { clientEnv } from "@/config/env";
import {
  assetsFor,
  usdcFor,
  type StellarAsset,
  type StellarNetworkName,
} from "@/lib/stellar/assets";
import { STELLAR_NETWORK_NAME } from "@/lib/stellar/network";

export interface TrustlineOption {
  value: string;
  label: string;
  issuer: string;
}

export function trustlineOptionsFor(
  network: StellarNetworkName,
  usdcIssuerOverride?: string,
): TrustlineOption[] {
  const usdc = usdcFor(network, usdcIssuerOverride);
  return assetsFor(network).map((asset): TrustlineOption => {
    const resolved: StellarAsset = asset.code === "USDC" && usdc ? usdc : asset;
    return {
      value: resolved.contractId ?? resolved.issuer,
      label: resolved.code,
      issuer: resolved.issuer,
    };
  });
}

export const trustlineOptions = trustlineOptionsFor(
  STELLAR_NETWORK_NAME,
  clientEnv.NEXT_PUBLIC_USDC_ISSUER,
);
