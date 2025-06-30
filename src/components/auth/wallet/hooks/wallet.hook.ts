import {
  ISupportedWallet,
  WalletNetwork,
} from "@creit.tech/stellar-wallets-kit";
import { kit } from "../constants/wallet-kit.constant";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import getPublicKey from "@stellar/freighter-api";
import { useRouter } from "next/navigation";
import { Account, TransactionBuilder, Operation, Networks } from "stellar-sdk";

export const useWallet = () => {
  const router = useRouter();
  const { connectWalletStore, disconnectWalletStore } =
    useGlobalAuthenticationStore();

  function buildChallengeTx(
    userPublicKey: string,
    authPublicKey: string
  ): string {
    const dummyAccount = new Account(authPublicKey, "0");

    const tx = new TransactionBuilder(dummyAccount, {
      fee: "100",
      networkPassphrase: Networks.PUBLIC,
    })
      .addOperation(
        Operation.manageData({
          name: "auth",
          value: `Sign in @ ${new Date().toISOString()}`,
          source: userPublicKey,
        })
      )
      .setTimeout(300)
      .build();

    return tx.toXDR();
  }

  const connectWallet = async () => {
    await kit.openModal({
      modalTitle: "Connect Wallet",
      onWalletSelected: async (option: ISupportedWallet) => {
        kit.setWallet(option.id);
        const { address } = await kit.getAddress();
        const { name } = option;

        const authPublicKey = (await getPublicKey.getAddress()).address;

        const challengeXDR = buildChallengeTx(address, authPublicKey);

        await kit.signTransaction(challengeXDR, {
          address,
          networkPassphrase: WalletNetwork.TESTNET,
        });

        connectWalletStore(address, name);
      },
    });
  };

  const disconnectWallet = async () => {
    await kit.disconnect();
    disconnectWalletStore();
    router.push("/");
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (disconnectWallet) {
        await disconnectWallet();
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  return {
    connectWallet,
    disconnectWallet,
    handleConnect,
    handleDisconnect,
  };
};
