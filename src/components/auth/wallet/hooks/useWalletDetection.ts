import { useState, useEffect } from "react";
import { getAddress } from "@stellar/freighter-api";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { WalletDetectionResult, WalletType } from "../types/wallet.types";

/**
 * Attempts to retrieve the Stellar public key from the Freighter extension.
 * Returns null — without throwing — when Freighter is not installed or
 * when the user has not yet granted the site permission to read their address.
 * This lets calling UI gracefully prompt the user to connect rather than
 * crashing on an unhandled rejection.
 */
const retrieveFreighterAddress = async (): Promise<string | null> => {
  try {
    const { address } = await getAddress();
    return address ?? null;
  } catch {
    return null;
  }
};

/**
 * Hook to detect available wallets in the user's browser.
 *
 * When Freighter is detected and the user has already granted permission,
 * the hook also calls `getAddress()` to retrieve their Stellar public key,
 * stores it in `useGlobalAuthenticationStore`, and exposes it as
 * `freighterAddress` in the return value.
 *
 * @returns Detection status for each wallet type, a loading flag, and the
 *          Freighter address (or null if unavailable / not yet permitted).
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
    freighterAddress: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const detectWallets = async () => {
      setIsLoading(true);

      try {
        const freighterInstalled = await detectFreighter();

        // Only attempt address retrieval when the extension is present.
        // retrieveFreighterAddress() swallows the "not connected" error so
        // the UI can decide how to prompt the user rather than receiving an
        // exception.
        let freighterAddress: string | null = null;
        if (freighterInstalled) {
          freighterAddress = await retrieveFreighterAddress();

          if (freighterAddress) {
            useGlobalAuthenticationStore.getState().connectWalletStore(freighterAddress, "Freighter");
          }
        }

        const results: WalletDetectionResult = {
          freighter: freighterInstalled,
          albedo: await detectAlbedo(),
          lobstr: await detectLobstr(),
          metamask: await detectMetaMask(),
          walletconnect: true, // Always available
          freighterAddress,
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
    return typeof window !== "undefined" && "freighterApi" in window;
  } catch {
    return false;
  }
};

/**
 * Detect Albedo wallet
 */
const detectAlbedo = async (): Promise<boolean> => {
  try {
    // Albedo doesn't require extension installation, it's web-based
    return true;
  } catch {
    return false;
  }
};

/**
 * Detect LOBSTR wallet
 */
const detectLobstr = async (): Promise<boolean> => {
  try {
    // LOBSTR can be used via WalletConnect or browser extension
    return typeof window !== "undefined" && ("lobstrApi" in window || true);
  } catch {
    return false;
  }
};

/**
 * Detect MetaMask wallet extension
 */
const detectMetaMask = async (): Promise<boolean> => {
  try {
    if (typeof window === "undefined") return false;

    const ethereum = window.ethereum;
    if (!ethereum) return false;

    if (ethereum.isMetaMask) {
      return true;
    }

    if (ethereum.providers) {
      return ethereum.providers.some((provider: { isMetaMask?: boolean }) => provider.isMetaMask);
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
    .filter(([key, value]) => key !== "freighterAddress" && value === true)
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
