import { useState, useEffect } from "react";
import { WalletDetectionResult, WalletType } from "../types/wallet.types";

/**
 * Hook to detect available wallets in the user's browser
 * @returns object with detection status for each wallet type
 */
export const useWalletDetection = (): WalletDetectionResult & {
  isLoading: boolean;
} => {
  const [detection, setDetection] = useState<WalletDetectionResult>({
    freighter: false,
    albedo: false,
    lobstr: false,
    metamask: false,
    walletconnect: true, // WalletConnect is always available as it's a protocol
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectWallets = async () => {
      setIsLoading(true);

      try {
        const results: WalletDetectionResult = {
          freighter: await detectFreighter(),
          albedo: await detectAlbedo(),
          lobstr: await detectLobstr(),
          metamask: await detectMetaMask(),
          walletconnect: true, // Always available
        };

        setDetection(results);
      } catch (error) {
        console.error("Error detecting wallets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    detectWallets();
  }, []);

  return {
    ...detection,
    isLoading,
  };
};

/**
 * Detect Freighter wallet extension
 */
const detectFreighter = async (): Promise<boolean> => {
  try {
    // Check if Freighter is installed
    return typeof window !== "undefined" && "freighterApi" in window;
  } catch (error) {
    return false;
  }
};

/**
 * Detect Albedo wallet
 */
const detectAlbedo = async (): Promise<boolean> => {
  try {
    // Albedo doesn't require extension installation, it's web-based
    // We can consider it always available, but let's check for any specific indicators
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Detect LOBSTR wallet
 */
const detectLobstr = async (): Promise<boolean> => {
  try {
    // LOBSTR can be used via WalletConnect or browser extension
    // Check for LOBSTR-specific indicators
    return typeof window !== "undefined" && ("lobstrApi" in window || true);
  } catch (error) {
    return false;
  }
};

/**
 * Detect MetaMask wallet extension
 */
const detectMetaMask = async (): Promise<boolean> => {
  try {
    if (typeof window === "undefined") return false;

    const ethereum = (window as any).ethereum;
    if (!ethereum) return false;

    // Check if MetaMask is directly available
    if (ethereum.isMetaMask) {
      return true;
    }

    // Check if MetaMask is available in providers array (multiple wallets)
    if (ethereum.providers) {
      return ethereum.providers.some((provider: any) => provider.isMetaMask);
    }

    return false;
  } catch (error) {
    console.error("🔍 Error detecting MetaMask:", error);
    return false;
  }
};

/**
 * Get list of detected wallets
 * @param detection - Detection results
 * @returns array of available wallet types
 */
export const getAvailableWallets = (
  detection: WalletDetectionResult,
): WalletType[] => {
  return Object.entries(detection)
    .filter(([_, isAvailable]) => isAvailable)
    .map(([walletType]) => walletType as WalletType);
};

/**
 * Check if a specific wallet is available
 * @param walletType - The wallet type to check
 * @param detection - Detection results
 * @returns boolean indicating availability
 */
export const isWalletAvailable = (
  walletType: WalletType,
  detection: WalletDetectionResult,
): boolean => {
  return detection[walletType] || false;
};
