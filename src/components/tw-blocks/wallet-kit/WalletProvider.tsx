"use client";

import * as React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useGlobalAuthenticationStore } from "@/core/store/data";

/**
 * Type definition for the wallet context
 * Contains wallet address, name, and functions to manage wallet state
 */
type WalletContextType = {
  walletAddress: string | null;
  walletName: string | null;
  setWalletInfo: (address: string, name: string) => void;
  clearWalletInfo: () => void;
};

/**
 * Create the React context for wallet state management
 */
const WalletContext = createContext<WalletContextType | undefined>(undefined);

/**
 * Wallet Provider component that wraps the application
 * Manages wallet state by reading from the canonical Zustand store (useGlobalAuthenticationStore)
 * This ensures consistency across the entire application
 */
export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);

  // Subscribe to the Zustand store
  const address = useGlobalAuthenticationStore((s) => s.address);
  const name = useGlobalAuthenticationStore((s) => s.name);
  const connectWalletStore = useGlobalAuthenticationStore(
    (s) => s.connectWalletStore
  );
  const disconnectWalletStore = useGlobalAuthenticationStore(
    (s) => s.disconnectWalletStore
  );

  /**
   * Sync context state with Zustand store on mount and when store updates
   */
  useEffect(() => {
    setWalletAddress(address || null);
    setWalletName(name || null);
  }, [address, name]);

  /**
   * Set wallet information and sync with the Zustand store
   *
   * @param address - The wallet's public address
   * @param name - The name/identifier of the wallet (e.g., "Freighter", "Albedo")
   */
  const setWalletInfo = (address: string, name: string) => {
    connectWalletStore(address, name);
  };

  /**
   * Clear wallet information and sync with the Zustand store
   */
  const clearWalletInfo = () => {
    disconnectWalletStore();
  };

  return (
    <WalletContext.Provider
      value={{ walletAddress, walletName, setWalletInfo, clearWalletInfo }}
    >
      {children}
    </WalletContext.Provider>
  );
};

/**
 * Custom hook to access the wallet context
 * Provides wallet state and functions to components
 * Throws an error if used outside of WalletProvider
 */
export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within WalletProvider");
  }
  return context;
};
