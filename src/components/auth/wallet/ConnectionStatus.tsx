"use client";

import { WalletInfo } from "./types/wallet.types";
import { formatAddress } from "./utils/walletValidation";
import { getWalletConfig } from "./utils/walletConfig";

interface ConnectionStatusProps {
  connectedWallets: WalletInfo[];
  selectedWallet?: WalletInfo;
  onSelectWallet: (wallet: WalletInfo) => void;
  onDisconnect: (walletType: any) => void;
}

export default function ConnectionStatus({
  connectedWallets,
  selectedWallet,
  onSelectWallet,
  onDisconnect,
}: ConnectionStatusProps) {
  if (connectedWallets.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No wallets connected
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm">Connected Wallets</h3>

      {connectedWallets.map((wallet) => {
        const config = getWalletConfig(wallet.walletType);
        const isSelected = selectedWallet?.address === wallet.address;

        return (
          <div
            key={`${wallet.walletType}-${wallet.address}`}
            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
              isSelected
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
            onClick={() => onSelectWallet(wallet)}
          >
            <div className="flex items-center space-x-3">
              <div className="text-lg" role="img" aria-label={config.name}>
                {config.icon}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">{config.name}</span>
                  {isSelected && (
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatAddress(wallet.address)}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-400 capitalize">
                    {wallet.chain}
                  </span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="text-xs text-green-600 dark:text-green-400">
                    {wallet.connectionStatus}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDisconnect(wallet.walletType);
              }}
              className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Disconnect
            </button>
          </div>
        );
      })}
    </div>
  );
}
