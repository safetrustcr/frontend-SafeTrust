import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { setSessionCookie } from "@/lib/auth/session";
import { toast } from "sonner";
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

      // Request SEP-10 challenge and authenticate via Firebase custom token
      const challengeRes = await fetch("/api/auth/wallet/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: address }),
      });
      if (!challengeRes.ok) {
        throw new Error("Failed to obtain SEP-10 challenge");
      }
      const { transaction, network_passphrase } = await challengeRes.json();

      // Sign transaction
      const { signedTxXdr: signedTx } = await kit.signTransaction(transaction, {
        networkPassphrase: network_passphrase,
        address,
      });

      // Verify transaction and get custom token
      const verifyRes = await fetch("/api/auth/wallet/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transaction: signedTx }),
      });
      if (!verifyRes.ok) {
        throw new Error("SEP-10 verification failed");
      }
      const { customToken } = await verifyRes.json();

      // Sign in with Firebase custom token
      const cred = await signInWithCustomToken(auth, customToken);
      const idToken = await cred.user.getIdToken();
      setSessionCookie(idToken);

      connectWalletStore(address, wallet.name);

      toast.success("Wallet authentication successful!", {
        description: "Redirecting to your dashboard...",
      });

      setIsStellarModalOpen(false);
      setSelectedWalletType(null);
      router.push("/dashboard/escrow-dashboard");
    } catch (error: unknown) {
      console.error("Error authenticating with Stellar wallet:", error);
      setError(
        `Failed to authenticate with ${wallet.name}: ${(error as Error)?.message || "Unknown error"}`,
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
