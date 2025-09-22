"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

export type WalletType = "stellar" | "metamask" | "walletconnect";

interface MainWalletSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletTypeSelected: (walletType: WalletType) => void;
}

const walletOptions = [
  {
    id: "stellar" as WalletType,
    name: "Stellar",
    icon: "/img/wallet/stellar.png",
    description: "Freighter, Albedo, LOBSTR"
  },
  {
    id: "metamask" as WalletType,
    name: "MetaMask",
    icon: "/img/wallet/metamask.png",
    description: "Browser extension wallet"
  },
  {
    id: "walletconnect" as WalletType,
    name: "WalletConnect",
    icon: "/img/wallet/walletconnect.png",
    description: "300+ mobile & desktop wallets"
  },
];

export const MainWalletSelectionModal: React.FC<
  MainWalletSelectionModalProps
> = ({ isOpen, onClose, onWalletTypeSelected }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Connect Wallet</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Choose your preferred wallet
            </p>

            {walletOptions.map((option) => {
              return (
                <Card
                  key={option.id}
                  className="cursor-pointer bg-transparent transition-all duration-200 hover:shadow-md hover:ring-2 hover:ring-blue-200"
                  onClick={() => onWalletTypeSelected(option.id)}
                >
                  <CardContent className="!p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={option.icon}
                          alt={option.name}
                          className="w-8 h-8 rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = "/img/logo.png";
                          }}
                        />
                        <div>
                          <h3 className="font-semibold">{option.name}</h3>
                          <p className="text-xs text-gray-500">{option.description}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
