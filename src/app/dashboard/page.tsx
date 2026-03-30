"use client";

import Link from "next/link";
import { useMultiWallet } from "@/components/auth/wallet/hooks/multi-wallet.hook";
import { MainWalletSelectionModal } from "@/components/auth/wallet/components/MainWalletSelectionModal";
import { WalletSelectionModal } from "@/components/auth/wallet/components/WalletSelectionModal";
import { MetaMaskWalletModal } from "@/components/auth/wallet/components/MetaMaskWalletModal";
import { formatAddress } from "@/components/auth/wallet/utils/walletValidation";
import { Button } from "@/components/ui/button";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { LogOut, Wallet } from "lucide-react";
import { CacheStatus } from "@/components/performance/CacheStatus";
import { useEscrowsBySignerQuery } from "@/components/tw-blocks/tanstack/useEscrowsBySignerQuery";

const DashboardPage = () => {
  const {
    disconnectWallet,
    handleConnect,
    isMainModalOpen,
    isStellarModalOpen,
    isMetaMaskModalOpen,
    closeMainModal,
    closeStellarModal,
    closeMetaMaskModal,
    handleWalletTypeSelected,
    handleStellarWalletSelected,
    handleMetaMaskSelected,
  } = useMultiWallet();
  const { address } = useGlobalAuthenticationStore();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-xl font-semibold">Dashboard Page</div>
        <CacheStatus />
      </div>

      <div className="rounded-md border p-4 bg-muted text-foreground">
        {address ? (
          <>
            <p className="text-lg font-semibold">
              Welcome,{" "}
              <span className="font-mono break-all md:truncate md:max-w-xs inline-block align-bottom">
                {address}
              </span>
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={disconnectWallet}
            >
              Disconnect
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">No wallet connected</p>
            <Button onClick={handleConnect}>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Active Escrows</h3>
        {/* TODO: wire in Batch N — GET_ESCROW_TRANSACTIONS via Apollo once backend is connected */}
        <p className="text-sm text-gray-500 italic">No escrows found.</p>
      </div>

      {/* Wallet Connection Modals */}
      <MainWalletSelectionModal
        isOpen={isMainModalOpen}
        onClose={closeMainModal}
        onWalletTypeSelected={handleWalletTypeSelected}
      />
      <WalletSelectionModal
        isOpen={isStellarModalOpen}
        onClose={closeStellarModal}
        onWalletSelected={handleStellarWalletSelected}
      />
      <MetaMaskWalletModal
        isOpen={isMetaMaskModalOpen}
        onClose={closeMetaMaskModal}
        onWalletConnected={handleMetaMaskSelected}
      />
    </div>
  );
};

export default DashboardPage;