import { getWalletKit, signXdr as canonicalSignXdr } from "@/lib/stellar/wallet-kit";
import { STELLAR_NETWORK } from "@/lib/stellar/wallet-kit";

// Re-export the canonical kit functions
export { getWalletKit, STELLAR_NETWORK };
export const signXdr = canonicalSignXdr;

// Backward compatibility adapter for legacy signTransaction function
interface SignTransactionParams {
  unsignedTransaction: string;
  address: string;
}

/**
 * @deprecated Use signXdr() from @/lib/stellar/wallet-kit instead
 * This adapter delegates to the canonical signXdr function
 */
export const signTransaction = async ({
  unsignedTransaction,
  address,
}: SignTransactionParams): Promise<string> => {
  return canonicalSignXdr(unsignedTransaction, address);
};

// Keep the old `kit` export for backward compatibility, but it's a getter now
type OpenModalOptions = Parameters<
  ReturnType<typeof getWalletKit>["openModal"]
>[0];

export const kit = {
  openModal: (options: OpenModalOptions) => getWalletKit().openModal(options),
  setWallet: (walletId: string) => getWalletKit().setWallet(walletId),
  getAddress: () => getWalletKit().getAddress(),
  disconnect: () => getWalletKit().disconnect(),
  signTransaction: (xdr: string, options: Record<string, unknown>) =>
    getWalletKit().signTransaction(xdr, options),
};
