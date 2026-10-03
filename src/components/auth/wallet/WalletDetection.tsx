"use client";

import React from "react";
import {
  useWalletDetection,
  getAvailableWallets,
} from "./hooks/useWalletDetection";
import { getWalletConfig } from "./utils/walletConfig";

interface WalletDetectionProps {
  onWalletDetected?: (wallets: string[]) => void;
  showResults?: boolean;
}

export default function WalletDetection({
  onWalletDetected,
  showResults = true,
}: WalletDetectionProps) {
  const detection = useWalletDetection();
  const availableWallets = getAvailableWallets(detection);

  // Notify parent component when detection is complete
  React.useEffect(() => {
    if (!detection.isLoading && onWalletDetected) {
      onWalletDetected(availableWallets);
    }
  }, [detection.isLoading, availableWallets, onWalletDetected]);

  if (!showResults) return null;

  if (detection.isLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
        <span className="text-sm">Detecting wallets...</span>
      </div>
    );
  }

  if (availableWallets.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No wallets detected. Please install a supported wallet extension.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm">Detected Wallets</h3>
      <div className="grid grid-cols-2 gap-2">
        {availableWallets.map((walletType) => {
          const config = getWalletConfig(walletType);
          return (
            <div
              key={walletType}
              className="flex items-center space-x-2 p-2 border rounded-lg bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
            >
              <div className="text-lg" role="img" aria-label={config.name}>
                {config.icon}
              </div>
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                {config.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
