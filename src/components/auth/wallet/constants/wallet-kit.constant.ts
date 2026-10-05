import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID,
  XBULL_ID
} from "@creit.tech/stellar-wallets-kit";

let instance: StellarWalletsKit | null = null;

export function getKit(): StellarWalletsKit {
  if (typeof window === "undefined") {
    throw new Error("StellarWalletsKit is browser-only");
  }

  instance ??= new StellarWalletsKit({
    network: WalletNetwork.TESTNET,
    selectedWalletId: FREIGHTER_ID,
    modules: allowAllModules(),
  });

  return instance;
}

export const kit: StellarWalletsKit = new Proxy({} as StellarWalletsKit, {
  get(_target, property) {
    const walletKit = getKit();
    const value = Reflect.get(walletKit, property, walletKit);
    return typeof value === "function" ? value.bind(walletKit) : value;
  },
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
  const { signedTxXdr } = await getKit().signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: network,
  });

  return signedTxXdr;
};