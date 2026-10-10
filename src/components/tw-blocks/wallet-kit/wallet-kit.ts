import { WalletNetwork } from "@creit.tech/stellar-wallets-kit/types";
import {
  getKit,
  kit,
} from "@/components/auth/wallet/constants/wallet-kit.constant";

/**
 * Stellar Wallet Kit
 *
 * SafeTrust local modification: reuse the app's single kit instance (the
 * one the auth flow calls `setWallet` on) instead of creating a second kit
 * pinned to Freighter. Escrow transactions are then signed by the wallet
 * the guest actually connected.
 */
export { getKit, kit };
interface SignTransactionParams {
  unsignedTransaction: string;
  address: string;
}

/**
 * Sign Transaction Params
 *
 * @param unsignedTransaction - The unsigned transaction
 * @param address - The address of the wallet
 */
export const signTransaction = async ({
  unsignedTransaction,
  address,
}: SignTransactionParams): Promise<string> => {
  const kit = await getKit();
  const { signedTxXdr } = await kit.signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  return signedTxXdr;
};
