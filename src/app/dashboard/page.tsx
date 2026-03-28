"use client";

import { useMultiWallet } from "@/components/auth/wallet/hooks/multi-wallet.hook";
import { MainWalletSelectionModal } from "@/components/auth/wallet/components/MainWalletSelectionModal";
import { WalletSelectionModal } from "@/components/auth/wallet/components/WalletSelectionModal";
import { MetaMaskWalletModal } from "@/components/auth/wallet/components/MetaMaskWalletModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { EscrowTable } from "@/components/dashboard/EscrowTable";
import { Wallet, Plus, Users, ClipboardList, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

const escrowStats = [
  { label: "Pending", count: 0, color: "bg-yellow-100 text-yellow-800" },
  { label: "Active", count: 0, color: "bg-blue-100 text-blue-800" },
  { label: "Completed", count: 0, color: "bg-green-100 text-green-800" },
  { label: "Disputed", count: 0, color: "bg-red-100 text-red-800" },
];

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
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-md border p-4 bg-muted text-foreground">
        {address ? (
          <>
            <p className="text-lg font-semibold">
              Welcome, <span className="font-mono">{truncateAddress(address)}</span>
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={disconnectWallet}
            >
              <LogOut className="mr-2 h-4 w-4" />
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

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">QUICK ACTIONS</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/dashboard/escrow/create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Escrow
          </Button>
          {/* TODO: wire route in Issue 4 */}
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/dashboard/users")}
          >
            <Users className="mr-2 h-4 w-4" />
            User Management
          </Button>
          {/* TODO: wire route in Issue 5 */}
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/dashboard/escrow")}
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            My Escrows
          </Button>
        </div>
      </div>

      {/* Escrow Overview */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">ESCROW OVERVIEW</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {escrowStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="!p-4 flex flex-col items-center gap-2">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="text-2xl font-bold">{stat.count}</span>
                <Badge className={stat.color}>
                  {stat.label}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Escrow Transactions */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">RECENT ESCROW TRANSACTIONS</h3>
        <EscrowTable escrows={[]} userRole="guest" />
        <p className="text-sm text-muted-foreground text-center mt-4">
          No escrow transactions yet. Create your first escrow to get started.
        </p>
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
