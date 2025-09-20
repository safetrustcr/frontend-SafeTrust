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
  const [showWalletModal, setShowWalletModal] = useState(false);

  const multiWallet = useMultiWallet();

  const connectWallet = async () => {
    await kit.openModal({
      modalTitle: "Connect Wallet",
      onWalletSelected: async (option: ISupportedWallet) => {
        kit.setWallet(option.id);
        const { address } = await kit.getAddress();
        const { name } = option;
        connectWalletStore(address, name);
      },
    });
  };

  const disconnectWallet = async () => {
    await kit.disconnect();
    disconnectWalletStore();
    router.push("/");
  };

  const handleConnect = useCallback(async () => {
    try {
      // Show the new multi-wallet modal instead
      setShowWalletModal(true);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  }, [setShowWalletModal]);

  const handleMultiWalletConnect = useCallback(async (walletInfo: WalletInfo) => {
    try {
      // Update global store with the connected wallet
      connectWalletStore(walletInfo.address, walletInfo.name);
      setShowWalletModal(false);
    } catch (error) {
      console.error("Error handling multi-wallet connect:", error);
    }
  }, [connectWalletStore, setShowWalletModal]);

  const handleDisconnect = async () => {
    try {
      if (disconnectWallet) {
        await disconnectWallet();
      }
      // Also disconnect from multi-wallet
      multiWallet.reset();
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  return {
    connectWallet,
    disconnectWallet,
    handleConnect,
    handleDisconnect,
    showWalletModal,
    setShowWalletModal,
    handleMultiWalletConnect,
    multiWallet,
    connectStellarWallet: connectWallet, // Alias for clarity
  };
};
