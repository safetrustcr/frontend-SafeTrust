"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useWalletDetection } from "./hooks/useWalletDetection";
import { useMultiWallet } from "./hooks/useMultiWallet";
import WalletOption from "./WalletOption";
import ConnectionStatus from "./ConnectionStatus";
import { STELLAR_WALLETS } from "./utils/walletConfig";
import type { WalletInfo, WalletType } from "@/types/wallet";
import { toast } from "react-toastify";

interface SimpleWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnected?: (walletInfo: WalletInfo) => void;
}

export default function SimpleWalletModal({
  isOpen,
  onClose,
  onWalletConnected,
}: SimpleWalletModalProps) {
  const detection = useWalletDetection();
  const {
    connectedWallets,
    selectedWallet,
    error,
    connectWallet,
    disconnectWallet,
    selectWallet,
    reset,
  } = useMultiWallet();

  const [connectingWallets, setConnectingWallets] = useState<Set<WalletType>>(
    new Set(),
  );
  const lastConnectedWallet = useRef<string | null>(null);

  // Reset connection states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setConnectingWallets(new Set());
      lastConnectedWallet.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (
      selectedWallet &&
      onWalletConnected &&
      selectedWallet.address !== lastConnectedWallet.current
    ) {
      lastConnectedWallet.current = selectedWallet.address;
      onWalletConnected(selectedWallet);
    }
  }, [selectedWallet, onWalletConnected]);

  const handleConnect = async (walletType: WalletType) => {
    setConnectingWallets((prev) => new Set([...prev, walletType]));

    try {
      await connectWallet(walletType);
      toast.success(`${walletType} connected!`);
      onClose();
    } catch {
      toast.error(`${walletType} connection failed`);
    } finally {
      setConnectingWallets((prev) => {
        const updated = new Set(prev);
        updated.delete(walletType);
        return updated;
      });
    }
  };

  const handleDisconnect = async (walletType: WalletType) => {
    try {
      await disconnectWallet(walletType);
    } catch (error) {
      console.error("Disconnect failed:", error);
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
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error.message}</p>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="font-medium text-sm mb-3">
            Available Stellar Wallets
          </h3>
          {STELLAR_WALLETS.map((walletType) => (
            <WalletOption
              key={walletType}
              walletType={walletType}
              isAvailable={detection[walletType]}
              isConnecting={connectingWallets.has(walletType)}
              isConnected={isWalletConnected(walletType)}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          ))}
        </div>

        {connectedWallets.length > 0 && (
          <>
            <div className="my-6 border-t" />
            <ConnectionStatus
              connectedWallets={connectedWallets}
              selectedWallet={selectedWallet}
              onSelectWallet={selectWallet}
              onDisconnect={handleDisconnect}
            />
          </>
        )}

        <div className="mt-6 flex gap-3">
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
            className="w-full mt-2 text-red-600"
          >
            Disconnect All
          </Button>
        )}
      </div>
    </div>
  );
}
