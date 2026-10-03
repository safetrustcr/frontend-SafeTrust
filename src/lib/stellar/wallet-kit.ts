"use client";

import {
  allowAllModules,
  FREIGHTER_ID,
  StellarWalletsKit,
  WalletNetwork,
} from "@creit.tech/stellar-wallets-kit";

// Reuses the existing variable (documented in FE-23): "testnet" | "mainnet".
// WalletNetwork enum values are the network passphrases.
const NETWORK =
  process.env.NEXT_PUBLIC_TRUSTLESS_NETWORK === "mainnet"
    ? WalletNetwork.PUBLIC
    : WalletNetwork.TESTNET;

let instance: StellarWalletsKit | null = null;

/** Lazily creates the kit in the browser only (safe to import from SSR code). */
export function getWalletKit(): StellarWalletsKit {
  if (typeof window === "undefined") {
    throw new Error("getWalletKit() must only be called in the browser");
  }
  instance ??= new StellarWalletsKit({
    network: NETWORK,
    selectedWalletId: FREIGHTER_ID,
    modules: allowAllModules(),
  });
  return instance;
}

export async function signXdr(
  unsignedXdr: string,
  address: string
): Promise<string> {
  const { signedTxXdr } = await getWalletKit().signTransaction(unsignedXdr, {
    address,
    networkPassphrase: NETWORK,
  });
  return signedTxXdr;
}

export { NETWORK as STELLAR_NETWORK };
