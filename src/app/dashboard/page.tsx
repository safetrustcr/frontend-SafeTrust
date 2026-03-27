"use client";

import { useMultiWallet } from "@/components/auth/wallet/hooks/multi-wallet.hook";
import { Button } from "@/components/ui/button";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { Wallet } from "lucide-react";
import { CacheStatus } from "@/components/performance/CacheStatus";
import { EscrowActionsDemo } from "@/components/escrow/EscrowActionsDemo";

const DashboardPage = () => {
  const { disconnectWallet } = useMultiWallet();
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
            <p className="text-sm">Connected Wallet:</p>
            <p className="font-mono text-sm break-all">{address}</p>
          </>
        ) : (
          <p className="text-sm text-red-500">Wallet not connected</p>
        )}
      </div>

      <EscrowActionsDemo />

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Active Escrows</h3>
        {/* TODO: wire in Batch N — GET_ESCROW_TRANSACTIONS via Apollo once backend is connected */}
        <p className="text-sm text-gray-500 italic">No escrows found.</p>
      </div>

      {address && (
        <Button
          variant="outline"
          className="w-full bg-black text-white mt-4"
          onClick={disconnectWallet}
        >
          <Wallet className="mr-2 h-4 w-4" />
          Disconnect
        </Button>
      )}
    </div>
  );
};

export default DashboardPage;