import {
  ISupportedWallet,
  WalletNetwork,
} from "@creit.tech/stellar-wallets-kit";
import { kit } from "../constants/wallet-kit.constant";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

  return {
    connectWallet,
    disconnectWallet,
    handleConnect,
    handleDisconnect,
    error,
    isModalOpen,
    handleWalletSelected,
    closeModal,
  };
};
