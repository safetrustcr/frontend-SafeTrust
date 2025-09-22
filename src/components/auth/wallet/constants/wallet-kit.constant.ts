import {
  StellarWalletsKit,
  WalletNetwork,
  FreighterModule,
  AlbedoModule,
  LobstrModule,
  FREIGHTER_ID,
} from "@creit.tech/stellar-wallets-kit";

export const kit: StellarWalletsKit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: [new FreighterModule(), new AlbedoModule(), new LobstrModule()],
});

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
