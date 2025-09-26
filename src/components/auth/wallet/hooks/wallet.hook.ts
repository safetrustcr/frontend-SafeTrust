import {
  ISupportedWallet,
  WalletNetwork,
} from "@creit.tech/stellar-wallets-kit";
import { kit } from "../constants/wallet-kit.constant";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useMultiWallet } from "./useMultiWallet";
import { WalletInfo } from "../types/wallet.types";

export const useWallet = () => {
  const router = useRouter();
  const { connectWalletStore, disconnectWalletStore } =
    useGlobalAuthenticationStore();
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const multiWallet = useMultiWallet();

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

  const handleConnect = useCallback(async () => {
    try {
      // Show the new multi-wallet modal instead
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  }, [setIsModalOpen]);

  const handleMultiWalletConnect = useCallback(
    async (walletInfo: WalletInfo) => {
      try {
        // Update global store with the connected wallet
        connectWalletStore(walletInfo.address, walletInfo.name);
        setShowWalletModal(false);
      } catch (error) {
        console.error("Error handling multi-wallet connect:", error);
      }
    },
    [connectWalletStore, setShowWalletModal],
  );

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      // Also disconnect from multi-wallet if available
      if (multiWallet?.reset) {
        multiWallet.reset();
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
    error,
    isModalOpen,
    handleWalletSelected,
    closeModal,
    showWalletModal,
    setShowWalletModal,
    handleMultiWalletConnect,
    multiWallet,
    connectStellarWallet: connectWallet, // Alias for clarity
  };
};
