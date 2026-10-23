import type { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { FREIGHTER_ID } from "./wallet-ids";
import { STELLAR_NETWORK } from "./network";
import { useGlobalAuthenticationStore } from "@/core/store/data";

export { STELLAR_NETWORK } from "./network";
type WalletWindow = Window & {
  safeTrustWalletKit?: Promise<StellarWalletsKit>;
};

/** One lazy browser instance, retained across hot module replacement. */
export function loadWalletKit(): Promise<StellarWalletsKit> {
  if (typeof window === "undefined")
    return Promise.reject(new Error("Wallet kit is browser-only"));
  const browser = window as WalletWindow;
  browser.safeTrustWalletKit ??= import("@creit.tech/stellar-wallets-kit")
    .then(({ StellarWalletsKit, allowAllModules }) => {
      const modules = allowAllModules();
      const saved = useGlobalAuthenticationStore.getState();
      const restored =
        modules.find((module) => module.productId === saved.walletId) ??
        modules.find(
          (module) =>
            module.productName?.toLowerCase() === saved.name?.toLowerCase(),
        );
      return new StellarWalletsKit({
        network: STELLAR_NETWORK,
        selectedWalletId: restored?.productId ?? FREIGHTER_ID,
        modules,
      });
    })
    .catch((error: unknown) => {
      delete browser.safeTrustWalletKit;
      throw error;
    });
  return browser.safeTrustWalletKit;
}

type SignOptions = NonNullable<
  Parameters<StellarWalletsKit["signTransaction"]>[1]
>;
async function signWalletTransaction(
  unsignedXdr: string,
  options: SignOptions = {},
) {
  const address =
    options.address ?? useGlobalAuthenticationStore.getState().address;
  if (!address) throw new Error("No wallet connected");
  return (await loadWalletKit()).signTransaction(unsignedXdr, {
    ...options,
    address,
    networkPassphrase: options.networkPassphrase ?? STELLAR_NETWORK,
  });
}
export async function signXdr(
  unsignedXdr: string,
  address: string,
  networkPassphrase: string = STELLAR_NETWORK,
): Promise<string> {
  const { signedTxXdr } = await signWalletTransaction(unsignedXdr, {
    address,
    networkPassphrase,
  });
  return signedTxXdr;
}

// Async facade keeps importing hooks/providers free of the wallet SDK bundle.
export const kit = {
  getSupportedWallets: async () =>
    (await loadWalletKit()).getSupportedWallets(),
  setWallet: async (id: string) => (await loadWalletKit()).setWallet(id),
  getAddress: async (...args: Parameters<StellarWalletsKit["getAddress"]>) =>
    (await loadWalletKit()).getAddress(...args),
  getNetwork: async () => (await loadWalletKit()).getNetwork(),
  openModal: async (...args: Parameters<StellarWalletsKit["openModal"]>) =>
    (await loadWalletKit()).openModal(...args),
  disconnect: async () => {
    const pending =
      typeof window !== "undefined"
        ? (window as WalletWindow).safeTrustWalletKit
        : undefined;
    if (pending) await (await pending).disconnect();
  },
  signTransaction: signWalletTransaction,
  signMessage: async (
    ...args: Parameters<StellarWalletsKit["signMessage"]>
  ) => (await loadWalletKit()).signMessage(...args),
};
export function getWalletKit() {
  return kit;
}

export class WalletConnectionCancelledError extends Error {
  constructor() {
    super("Wallet connection was cancelled.");
    this.name = "WalletConnectionCancelledError";
  }
}
