"use client";

import { useMultiWallet } from "@/components/auth/wallet/hooks/multi-wallet.hook";
import { Button } from "@/components/ui/button";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { Wallet } from "lucide-react";

import { usePerformanceTracking } from "@/hooks/usePerformanceTracking";
import { CacheStatus } from "@/components/performance/CacheStatus";
import { EscrowActionsDemo } from "@/components/escrow/EscrowActionsDemo";
import { useQuery } from "@apollo/client";
import { GET_ESCROW_TRANSACTIONS } from "@/graphql/mutations/escrow";

const DashboardPage = () => {
  const { disconnectWallet } = useMultiWallet();
  const { address } = useGlobalAuthenticationStore();

  // Example of using Apollo query with performance tracking
  const { loading, data } = useQuery(GET_ESCROW_TRANSACTIONS, {
    variables: { limit: 10, offset: 0 },
    skip: !address,
  });

  usePerformanceTracking("DashboardQuery", loading);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : data?.escrow_transactions?.length > 0 ? (
          <ul className="space-y-2">
            {data.escrow_transactions.map((escrow: any) => (
              <li key={escrow.id} className="p-3 border rounded hover:bg-muted transition">
                <div className="flex justify-between">
                  <span>ID: {escrow.id.substring(0, 8)}...</span>
                  <span className="font-bold">{escrow.amount} XLM</span>
                </div>
                <div className="text-xs text-gray-500">Status: {escrow.status}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 italic">No escrows found.</p>
        )}
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
