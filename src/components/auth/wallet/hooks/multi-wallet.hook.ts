import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { WalletType } from "../components/MainWalletSelectionModal";
import { useMetaMaskWallet } from "./metamask-wallet.hook";

export const useMultiWallet = () => {
  const router = useRouter();
  const { connectWalletStore, address, name, disconnectWalletStore } =
    useGlobalAuthenticationStore();
  
  const metaMaskWallet = useMetaMaskWallet();
  
  const [error, setError] = useState<string | null>(null);
  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [isStellarModalOpen, setIsStellarModalOpen] = useState(false);
  const [isMetaMaskModalOpen, setIsMetaMaskModalOpen] = useState(false);
  const [isWalletConnectModalOpen, setIsWalletConnectModalOpen] = useState(false);
  const [selectedWalletType, setSelectedWalletType] = useState<WalletType | null>(null);

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
      case 'stellar':
        setIsStellarModalOpen(true);
        break;
      case 'metamask':
        handleMetaMaskDirectConnection();
        break;
      case 'walletconnect':
        setIsWalletConnectModalOpen(true);
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

  const closeWalletConnectModal = () => {
    setIsWalletConnectModalOpen(false);
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
      connectWalletStore(walletData.address, 'MetaMask');
      setSelectedWalletType(null);
    } catch (error: any) {
      if (error.message.includes('User rejected') || 
          error.message.includes('User denied') ||
          error.message.includes('No accounts found') ||
          error.message.includes('MetaMask is not installed')) {
        setIsMetaMaskModalOpen(true);
      } else {
        setError(error.message || `Failed to connect to MetaMask`);
      }
    }
  };



  

  const handleStellarWalletSelected = async (wallet: any) => {
    try {
      setIsStellarModalOpen(false);
      setSelectedWalletType(null);
    } catch (error) {
      setError(`Failed to connect to ${wallet.name}`);
    }
  };

  const handleMetaMaskSelected = async () => {
    try {
      const walletData = await metaMaskWallet.connectWallet();
      connectWalletStore(walletData.address, 'MetaMask');
      setIsMetaMaskModalOpen(false);
      setSelectedWalletType(null);
    } catch (error: any) {
      setError(error.message || `Failed to connect to MetaMask`);
    }
  };

  const handleWalletConnectSelected = async (walletData: any) => {
    try {
      connectWalletStore(walletData.address, 'WalletConnect');
      setIsWalletConnectModalOpen(false);
      setSelectedWalletType(null);
    } catch (error) {
      setError(`Failed to connect via WalletConnect`);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (metaMaskWallet.isConnected) {
        metaMaskWallet.disconnectWallet();
      }
      disconnectWalletStore();
      router.push("/");
    } catch (error) {
    }
  };

  const handleConnect = async () => {
    openMainModal();
  };

  return {
    // Modal states
    isMainModalOpen,
    isStellarModalOpen,
    isMetaMaskModalOpen,
    isWalletConnectModalOpen,
    selectedWalletType,
    
    // Modal handlers
    openMainModal,
    closeMainModal,
    handleWalletTypeSelected,
    closeStellarModal,
    closeMetaMaskModal,
    closeWalletConnectModal,
    
    handleStellarWalletSelected,
    handleMetaMaskSelected,
    handleWalletConnectSelected,
    
    handleConnect,
    disconnectWallet,
    error,
    setError,
    
    metaMaskWallet,
  };
};