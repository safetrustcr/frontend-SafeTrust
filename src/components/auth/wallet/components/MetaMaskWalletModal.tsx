"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { 
  X, 
  AlertTriangle, 
  ExternalLink,
  RefreshCw
} from "lucide-react";

interface MetaMaskWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnected: (walletData: any) => void;
}

export const MetaMaskWalletModal: React.FC<MetaMaskWalletModalProps> = ({
  isOpen,
  onClose,
  onWalletConnected
}) => {
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if MetaMask is installed
  useEffect(() => {
    if (isOpen) {
      const checkMetaMask = () => {
        if (typeof window !== "undefined") {
          const isInstalled = !!window.ethereum;
          setIsMetaMaskInstalled(isInstalled);
        } else {
          setIsMetaMaskInstalled(false);
        }
      };
      
      checkMetaMask();
    }
  }, [isOpen]);

  const connectMetaMask = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      let signer = null;
      let provider;

      if (window.ethereum == null) {
        throw new Error("MetaMask is not installed");
      } else {
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
      }

      // Get account details
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(address);

      const walletData = {
        address,
        network: network.name,
        balance: ethers.formatEther(balance),
        provider: window.ethereum
      };

      onWalletConnected(walletData);
    } catch (error: any) {
      setError(error.message || "Failed to connect to MetaMask");
    } finally {
      setIsConnecting(false);
    }
  };

  const installMetaMask = () => {
    window.open("https://metamask.io/download/", "_blank");
  };

  const refreshConnection = () => {
    setError(null);
    setIsConnecting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {!isMetaMaskInstalled ? "Install MetaMask" : "Connect MetaMask"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          {!isMetaMaskInstalled ? (
            /* MetaMask Not Installed */
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <img 
                  src="/img/wallet/metamask.png" 
                  alt="MetaMask"
                  className="w-16 h-16 rounded-lg"
                />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">MetaMask Not Found</h3>
                <p className="text-gray-600">Install MetaMask to connect your wallet</p>
              </div>

              <div className="flex space-x-3">
                <Button 
                  onClick={installMetaMask}
                  className="flex-1"
                  size="lg"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Install MetaMask
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            /* MetaMask Installed - Troubleshooting */
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <img 
                  src="/img/wallet/metamask.png" 
                  alt="MetaMask"
                  className="w-16 h-16 rounded-lg"
                />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">MetaMask Detected</h3>
                <p className="text-gray-600">Try connecting again</p>
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
                  onClick={connectMetaMask}
                  disabled={isConnecting}
                  className="flex-1"
                  size="lg"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Try Again"
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  size="lg"
                >
                  Cancel
                </Button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};