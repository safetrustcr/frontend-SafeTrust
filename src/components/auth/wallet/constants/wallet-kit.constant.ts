import type { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit/types";
import { FREIGHTER_ID } from "@/lib/stellar/wallet-ids";
import { XBULL_ID } from "@/lib/stellar/wallet-ids";

type WalletWindow = Window & {
  safeTrustWalletKit?: Promise<StellarWalletsKit>;
};

/** Load once per browser session, including across hot module replacement. */
export function getKit(): Promise<StellarWalletsKit> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("StellarWalletsKit is browser-only"));
  }
  const browser = window as WalletWindow;
  browser.safeTrustWalletKit ??= import("@creit.tech/stellar-wallets-kit")
    .then(
      ({ StellarWalletsKit, allowAllModules }) =>
        new StellarWalletsKit({
          network: WalletNetwork.TESTNET,
          selectedWalletId: FREIGHTER_ID,
          modules: allowAllModules(),
        }),
    )
    .catch((error: unknown) => {
      delete browser.safeTrustWalletKit;
      throw error;
    });
  return browser.safeTrustWalletKit;
}

// Keep the shared facade lightweight; every operation waits for the same loader.
export const kit = {
  getSupportedWallets: async () => (await getKit()).getSupportedWallets(),
  setWallet: async (id: string) => (await getKit()).setWallet(id),
  getAddress: async (...args: Parameters<StellarWalletsKit["getAddress"]>) =>
    (await getKit()).getAddress(...args),
  disconnect: async () => {
    // Email-only sessions have no wallet connection to close.
    const pending =
      typeof window !== "undefined"
        ? (window as WalletWindow).safeTrustWalletKit
        : undefined;
    if (pending) await (await pending).disconnect();
  },
  openModal: async (...args: Parameters<StellarWalletsKit["openModal"]>) =>
    (await getKit()).openModal(...args),
  signTransaction: async (
    ...args: Parameters<StellarWalletsKit["signTransaction"]>
  ) => (await getKit()).signTransaction(...args),
};

export const WALLET_IDS = {
  FREIGHTER: FREIGHTER_ID,
  XBULL: XBULL_ID,
} as const;

interface SignTransactionProps {
  unsignedTransaction: string;
  address: string;
  network?: WalletNetwork;
}

export const signTransaction = async ({
  unsignedTransaction,
  address,
  network = WalletNetwork.TESTNET,
}: SignTransactionProps): Promise<string> => {
  const { signedTxXdr } = await kit.signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: network,
  });

  return signedTxXdr;
};
