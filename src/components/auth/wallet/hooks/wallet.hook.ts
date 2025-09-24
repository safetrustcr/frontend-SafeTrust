import {
  ISupportedWallet,
  WalletNetwork,
} from "@creit.tech/stellar-wallets-kit";
import { kit } from "../constants/wallet-kit.constant";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signTransaction } from "@stellar/freighter-api";

export const useWallet = () => {
  const router = useRouter();
  const { connectWalletStore, address, name, disconnectWalletStore } =
    useGlobalAuthenticationStore();
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const connectWallet = () => {
    setIsModalOpen(true);
  };

  const handleWalletSelected = async (option: ISupportedWallet) => {
    try {
      kit.setWallet(option.id);
      const { address } = await kit.getAddress();
      const { name } = option;
      connectWalletStore(address, name);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      setError(`Failed to connect to ${option.name}`);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
      await disconnectWallet();
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  const signXDR = async (unsignedXDR: string): Promise<string> => {
    try {
      if (!address) {
        throw new Error("No wallet connected");
      }

      const { signedTxXdr } = await signTransaction(unsignedXDR, {
        address,
        networkPassphrase: WalletNetwork.TESTNET,
      });

      return signedTxXdr;
    } catch (error) {
      console.error("Error signing XDR:", error);
      throw error;
    }
  };

  return {
    kit,
    connectWallet,
    disconnectWallet,
    handleConnect,
    handleDisconnect,
    signXDR,
    address,
    name,
    error,
    isModalOpen,
    handleWalletSelected,
    closeModal,
  };
};
