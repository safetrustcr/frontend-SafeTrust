"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, QrCode, AlertTriangle } from "lucide-react";
import { initializeWalletKit, getWalletKit } from "@/lib/walletconnect";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnected: (walletData: any) => void;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
  onWalletConnected,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);
  const [walletKit, setWalletKit] = useState<any>(null);

  useEffect(() => {
    const initWalletKit = async () => {
      try {
        const kit = await initializeWalletKit();
        setWalletKit(kit);
      } catch (error: any) {
        setError(`Failed to initialize WalletConnect: ${error.message}`);
      }
    };

    if (isOpen) {
      initWalletKit();
    }
  }, [isOpen]);

  const connectWalletConnect = async () => {
    if (!walletKit) {
      setError("WalletConnect not initialized");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // Start pairing process
      const { uri, approval } = await walletKit.connect({
        requiredNamespaces: {
          eip155: {
            methods: ["eth_sendTransaction", "eth_signTransaction", "eth_sign", "personal_sign"],
            chains: ["eip155:1", "eip155:137"], // Ethereum and Polygon
            events: ["chainChanged", "accountsChanged"],
          },
        },
      });

      if (uri) {
        setQrCodeUri(uri);
      }

      // Wait for approval
      const session = await approval();
      
      if (session) {
        // Get the first account
        const accounts = session.namespaces.eip155?.accounts || [];
        const account = accounts[0];
        
        if (account) {
          const [namespace, chainId, address] = account.split(":");
          
          const walletData = {
            address,
            network: chainId === "1" ? "Ethereum" : "Polygon",
            balance: "0", // You can fetch this separately if needed
            provider: "WalletConnect",
            session
          };

          onWalletConnected(walletData);
        }
      }
    } catch (error: any) {
      setError(error.message || "Failed to connect via WalletConnect");
      setIsConnecting(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (walletKit) {
        walletKit.disconnect();
      }
    };
  }, [walletKit]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Connect Wallet</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-center">
          <div className="flex justify-center">
            <img
              src="/img/wallet/walletconnect.png"
              alt="WalletConnect"
              className="w-16 h-16 rounded-lg"
              onError={(e) => {
                e.currentTarget.src = "/img/logo.png";
              }}
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">
              Connect Mobile Wallet
            </h3>
            <p className="text-gray-600">
              Scan QR code with your mobile wallet
            </p>
          </div>

          {qrCodeUri ? (
            <div className="bg-gray-100 p-8 rounded-lg">
              <QrCode className="h-16 w-16 mx-auto text-blue-500" />
              <p className="text-sm text-gray-500 mt-2">
                QR Code displayed in popup
              </p>
            </div>
          ) : (
            <div className="bg-gray-100 p-8 rounded-lg">
              <QrCode className="h-16 w-16 mx-auto text-gray-400" />
              <p className="text-sm text-gray-500 mt-2">
                QR Code will appear here
              </p>
            </div>
          )}

          <div className="text-sm text-gray-600 space-y-1">
            <p>1. Open your mobile wallet app</p>
            <p>2. Scan the QR code above</p>
            <p>3. Approve the connection</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              onClick={connectWalletConnect}
              disabled={isConnecting || !walletKit}
              className="flex-1"
              size="lg"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
            <Button variant="outline" onClick={onClose} size="lg">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
