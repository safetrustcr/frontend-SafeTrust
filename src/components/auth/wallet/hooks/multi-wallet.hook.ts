import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { WalletType } from "../components/MainWalletSelectionModal";
import { useMetaMaskWallet } from "./metamask-wallet.hook";
import { kit } from "../constants/wallet-kit.constant";

// The wallet-status readiness check already keeps users from starting a
// connection for a wallet that isn't installed or is on the wrong network,
// so failures reaching here are either a user-initiated cancellation or a
// popup blocked by the browser (Albedo opens in a new window).
const isUserCancellation = (message: string): boolean =>
  /User declined|rejected/i.test(message);

const isPopupBlocked = (message: string): boolean => /popup/i.test(message);

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
    } catch (error: unknown) {
      const msg = (error as Error)?.message || "";
      if (
        msg.includes("User rejected") ||
        msg.includes("User denied") ||
        msg.includes("No accounts found") ||
        msg.includes("MetaMask is not installed")
      ) {
        setIsMetaMaskModalOpen(true);
      } else {
        setError(msg || `Failed to connect to MetaMask`);
      }
    }
  };

  const handleStellarWalletSelected = async (wallet: {
    id: string;
    name: string;
  }) => {
    try {
      setError(null);

      kit.setWallet(wallet.id);

      const { address } = await kit.getAddress();

      connectWalletStore(address, wallet.name);

      setIsStellarModalOpen(false);
      setSelectedWalletType(null);
    } catch (error: unknown) {
      const message = (error as Error)?.message || "";

      if (isUserCancellation(message)) {
        return;
      }

      if (isPopupBlocked(message)) {
        toast.error("Allow pop-ups for this site to use Albedo");
        return;
      }

      console.error("Error connecting to Stellar wallet:", error);
      setError(
        `Failed to connect to ${wallet.name}: ${message || "Unknown error"}`,
      );
    }
  };

  const handleMetaMaskSelected = async () => {
    try {
      const walletData = await metaMaskWallet.connectWallet();
      connectWalletStore(walletData.address, "MetaMask");
      setIsMetaMaskModalOpen(false);
      setSelectedWalletType(null);
    } catch (error: unknown) {
      setError((error as Error)?.message || `Failed to connect to MetaMask`);
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
