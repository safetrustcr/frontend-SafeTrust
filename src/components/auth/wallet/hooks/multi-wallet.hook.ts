import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { WalletType } from "../components/MainWalletSelectionModal";
import { useMetaMaskWallet } from "./metamask-wallet.hook";
import { kit } from "../constants/wallet-kit.constant";

export const useMultiWallet = () => {
  const router = useRouter();
  const { connectWalletStore, disconnectWalletStore } =
    useGlobalAuthenticationStore();

  const metaMaskWallet = useMetaMaskWallet();

  const [error, setError] = useState<string | null>(null);
  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [isStellarModalOpen, setIsStellarModalOpen] = useState(false);
  const [isMetaMaskModalOpen, setIsMetaMaskModalOpen] = useState(false);
  const [selectedWalletType, setSelectedWalletType] =
    useState<WalletType | null>(null);

  const openMainModal = () => {
    setIsMainModalOpen(true);
  };

  const closeMainModal = () => {
    setIsMainModalOpen(false);
    setSelectedWalletType(null);
  };

  const handleWalletTypeSelected = (walletType: WalletType) => {
    setSelectedWalletType(walletType);
    setIsMainModalOpen(false);

    switch (walletType) {
      case "stellar":
        setIsStellarModalOpen(true);
        break;
      case "metamask":
        handleMetaMaskDirectConnection();
        break;
      case "walletconnect":
        break;
    }
  };

  const closeStellarModal = () => {
    setIsStellarModalOpen(false);
    setSelectedWalletType(null);
  };

  const closeMetaMaskModal = () => {
    setIsMetaMaskModalOpen(false);
    setSelectedWalletType(null);
  };

  const handleMetaMaskDirectConnection = async () => {
    try {
      setError(null);

      if (typeof window === "undefined" || window.ethereum == null) {
        setIsMetaMaskModalOpen(true);
        return;
      }

      const walletData = await metaMaskWallet.connectWallet();
      connectWalletStore(walletData.address, "MetaMask");
      setSelectedWalletType(null);
    } catch (error: any) {
      if (
        error.message.includes("User rejected") ||
        error.message.includes("User denied") ||
        error.message.includes("No accounts found") ||
        error.message.includes("MetaMask is not installed")
      ) {
        setIsMetaMaskModalOpen(true);
      } else {
        setError(error.message || `Failed to connect to MetaMask`);
      }
    }
  };

  const handleStellarWalletSelected = async (wallet: any) => {
    try {
      setError(null);

      kit.setWallet(wallet.id);

      const { address } = await kit.getAddress();

      connectWalletStore(address, wallet.name);

      setIsStellarModalOpen(false);
      setSelectedWalletType(null);
    } catch (error: any) {
      console.error("Error connecting to Stellar wallet:", error);
      setError(
        `Failed to connect to ${wallet.name}: ${error.message || "Unknown error"}`
      );
    }
  };

  const handleMetaMaskSelected = async () => {
    try {
      const walletData = await metaMaskWallet.connectWallet();
      connectWalletStore(walletData.address, "MetaMask");
      setIsMetaMaskModalOpen(false);
      setSelectedWalletType(null);
    } catch (error: any) {
      setError(error.message || `Failed to connect to MetaMask`);
    }
  };

  const disconnectWallet = async () => {
    try {
      disconnectWalletStore();

      if (metaMaskWallet.isConnected) {
        metaMaskWallet.disconnectWallet();
      }

      await kit.disconnect();
      router.push("/");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      disconnectWalletStore();
      router.push("/");
    }
  };

  const handleConnect = async () => {
    openMainModal();
  };

  return {
    isMainModalOpen,
    isStellarModalOpen,
    isMetaMaskModalOpen,
    selectedWalletType,

    openMainModal,
    closeMainModal,
    handleWalletTypeSelected,
    closeStellarModal,
    closeMetaMaskModal,
    handleStellarWalletSelected,
    handleMetaMaskSelected,
    handleConnect,
    disconnectWallet,
    error,
    setError,
    metaMaskWallet,
  };
};
