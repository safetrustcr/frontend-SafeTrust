import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID,
  XBULL_ID
} from "@creit.tech/stellar-wallets-kit";

export const kit: StellarWalletsKit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: allowAllModules(),
  
});

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
