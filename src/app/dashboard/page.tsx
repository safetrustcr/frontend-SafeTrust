"use client";

import { MainWalletSelectionModal } from "@/components/auth/wallet/components/MainWalletSelectionModal";
import { MetaMaskWalletModal } from "@/components/auth/wallet/components/MetaMaskWalletModal";
import { WalletSelectionModal } from "@/components/auth/wallet/components/WalletSelectionModal";
import { useMultiWallet } from "@/components/auth/wallet/hooks/multi-wallet.hook";
import { CacheStatus } from "@/components/performance/CacheStatus";
import { Button } from "@/components/ui/button";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { getRoleBasedRedirect, getUserRole } from "@/utils/role-utils";
import { Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const DashboardPage = () => {
  const router = useRouter();
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

  // Role-based routing effect
  useEffect(() => {
    if (address) {
      const role = getUserRole();
      if (role) {
        const redirectPath = getRoleBasedRedirect(role);
        router.push(redirectPath);
      }
    }
  }, [address, router]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-xl font-semibold">Dashboard Page</div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <CacheStatus />
        </div>
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
            <Button variant="outline" size="sm" onClick={disconnectWallet}>
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
          </>
        )}
      </div>

      {/* Role-based routing will redirect users to appropriate dashboards */}

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
