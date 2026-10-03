import { useState, useEffect } from "react";
import { ethers } from "ethers";

interface MetaMaskWalletState {
  isConnected: boolean;
  address: string | null;
  network: string | null;
  balance: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  error: string | null;
}

export const useMetaMaskWallet = () => {
  const [walletState, setWalletState] = useState<MetaMaskWalletState>({
    isConnected: false,
    address: null,
    network: null,
    balance: null,
    provider: null,
    signer: null,
    error: null,
  });

  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  useEffect(() => {
    const checkMetaMask = () => {
      if (typeof window !== "undefined") {
        const isInstalled = !!window.ethereum;
        setIsMetaMaskInstalled(isInstalled);
      } else {
        setIsMetaMaskInstalled(false);
      }
    };

    checkMetaMask();

    const handleAccountsChanged = () => {
      checkMetaMask();
    };

    window.addEventListener("ethereum#initialized", handleAccountsChanged);

    return () => {
      window.removeEventListener("ethereum#initialized", handleAccountsChanged);
    };
  }, []);

  const connectWallet = async () => {
    try {
      setWalletState((prev) => ({ ...prev, error: null }));

      let signer = null;
      let provider;

      if (window.ethereum == null) {
        throw new Error("MetaMask is not installed");
      } else {
        provider = new ethers.BrowserProvider(
          window.ethereum as unknown as ethers.Eip1193Provider,
        );
        signer = await provider.getSigner();
      }

      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(address);

      setWalletState({
        isConnected: true,
        address,
        network: network.name,
        balance: ethers.formatEther(balance),
        provider,
        signer,
        error: null,
      });

      return {
        address,
        network: network.name,
        balance: ethers.formatEther(balance),
        provider,
        signer,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as Error)?.message || "Failed to connect to MetaMask";
      setWalletState((prev) => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      network: null,
      balance: null,
      provider: null,
      signer: null,
      error: null,
    });
  };

  const switchNetwork = async (chainId: string) => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });

      if (walletState.isConnected) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        setWalletState((prev) => ({ ...prev, network: network.name }));
      }
    } catch (error: unknown) {
      throw new Error((error as Error)?.message || "Failed to switch network");
    }
  };

  const addNetwork = async (networkDetails: {
    chainId: string;
    chainName: string;
    rpcUrls: string[];
    blockExplorerUrls: string[];
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
  }) => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [networkDetails],
      });
    } catch (error: unknown) {
      throw new Error((error as Error)?.message || "Failed to add network");
    }
  };

  const getBalance = async () => {
    try {
      if (!walletState.provider || !walletState.address) {
        throw new Error("Wallet not connected");
      }

      const balance = await walletState.provider.getBalance(
        walletState.address,
      );
      const formattedBalance = ethers.formatEther(balance);

      setWalletState((prev) => ({ ...prev, balance: formattedBalance }));
      return formattedBalance;
    } catch (error: unknown) {
      throw new Error((error as Error)?.message || "Failed to get balance");
    }
  };

  const signMessage = async (message: string) => {
    try {
      if (!walletState.signer) {
        throw new Error("Wallet not connected");
      }

      const signature = await walletState.signer.signMessage(message);
      return signature;
    } catch (error: unknown) {
      throw new Error((error as Error)?.message || "Failed to sign message");
    }
  };

  useEffect(() => {
    const ethereum = window.ethereum;
    if (
      !ethereum ||
      typeof ethereum.on !== "function" ||
      typeof ethereum.removeListener !== "function"
    )
      return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (walletState.isConnected) {
        setWalletState((prev) => ({ ...prev, address: accounts[0] }));
      }
    };

    const handleChainChanged = () => {
      if (walletState.isConnected) {
        connectWallet();
      }
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [walletState.isConnected]);

  return {
    ...walletState,
    isMetaMaskInstalled,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    addNetwork,
    getBalance,
    signMessage,
  };
};
