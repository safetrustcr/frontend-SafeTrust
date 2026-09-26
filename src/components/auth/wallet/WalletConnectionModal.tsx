"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useWalletDetection } from "./hooks/useWalletDetection";
import { useMultiWallet } from "./hooks/useMultiWallet";
import WalletOption from "./WalletOption";
import ConnectionStatus from "./ConnectionStatus";
import {
  STELLAR_WALLETS,
  ETHEREUM_WALLETS,
  POPULAR_WALLETS,
} from "./utils/walletConfig";
import { WalletType } from "./types/wallet.types";

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnected?: (walletInfo: any) => void;
}

export default function WalletConnectionModal({
  isOpen,
  onClose,
  onWalletConnected,
}: WalletConnectionModalProps) {
  const detection = useWalletDetection();
  const [activeTab, setActiveTab] = useState<"popular" | "stellar" | "ethereum">("popular");
  const {
    connectedWallets,
    selectedWallet,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    selectWallet,
    reset,
  } = useMultiWallet();

  useEffect(() => {
    if (selectedWallet && onWalletConnected) {
      onWalletConnected(selectedWallet);
    }
  }, [selectedWallet, onWalletConnected]);

  const handleConnect = async (walletType: WalletType) => {
    try {
      await connectWallet(walletType);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleDisconnect = async (walletType: WalletType) => {
    try {
      await disconnectWallet(walletType);
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  const isWalletConnected = (walletType: WalletType) => {
    return connectedWallets.some((w) => w.walletType === walletType);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">{error.message}</p>
          </div>
        )}

        <div className="w-full">
          <div className="grid w-full grid-cols-3 rounded-md bg-gray-100 p-1 dark:bg-gray-800">
            {(["popular", "stellar", "ethereum"] as const).map(tab => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded px-2 py-1 text-sm ${activeTab === tab ? "bg-white shadow dark:bg-gray-700" : ""}`}>
                {tab[0].toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === "popular" && <div className="mt-4 space-y-3">
            <h3 className="font-medium text-sm mb-3">Most Popular Wallets</h3>
            {POPULAR_WALLETS.map((walletType) => (
              <WalletOption
                key={walletType}
                walletType={walletType}
                isAvailable={detection[walletType]}
                isConnecting={isConnecting}
                isConnected={isWalletConnected(walletType)}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
              />
            ))}
          </div>}

          {activeTab === "stellar" && <div className="mt-4 space-y-3">
            <h3 className="font-medium text-sm mb-3">Stellar Wallets</h3>
            {STELLAR_WALLETS.map((walletType) => (
              <WalletOption
                key={walletType}
                walletType={walletType}
                isAvailable={detection[walletType]}
                isConnecting={isConnecting}
                isConnected={isWalletConnected(walletType)}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
              />
            ))}
          </div>}

          {activeTab === "ethereum" && <div className="mt-4 space-y-3">
            <h3 className="font-medium text-sm mb-3">Ethereum & BSC Wallets</h3>
            {ETHEREUM_WALLETS.map((walletType) => (
              <WalletOption
                key={walletType}
                walletType={walletType}
                isAvailable={detection[walletType]}
                isConnecting={isConnecting}
                isConnected={isWalletConnected(walletType)}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
              />
            ))}
          </div>}
        </div>

        {connectedWallets.length > 0 && (
          <>
            <Separator className="my-6" />
            <ConnectionStatus
              connectedWallets={connectedWallets}
              selectedWallet={selectedWallet}
              onSelectWallet={selectWallet}
              onDisconnect={handleDisconnect}
            />
          </>
        )}

        <div className="mt-6 flex space-x-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          {connectedWallets.length > 0 && (
            <Button
              onClick={() => {
                onClose();
                if (selectedWallet && onWalletConnected) {
                  onWalletConnected(selectedWallet);
                }
              }}
              className="flex-1"
            >
              Continue
            </Button>
          )}
        </div>

        {connectedWallets.length > 0 && (
          <Button
            variant="ghost"
            onClick={reset}
            className="w-full mt-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            Disconnect All
          </Button>
        )}

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            SafeTrust supports multiple blockchain networks for secure P2P
            transactions
          </p>
        </div>
      </div>
    </div>
  );
}
