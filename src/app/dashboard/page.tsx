"use client";

import { useWallet } from "@/components/auth/wallet/hooks/wallet.hook";
import { Button } from "@/components/ui/button";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { Wallet } from "lucide-react";

const DashboardPage = () => {
  const { handleDisconnect } = useWallet();
  const { address } = useGlobalAuthenticationStore();

  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold">Dashboard Page</div>

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

      {address && (
        <Button
          variant="outline"
          className="w-full bg-black text-white"
          onClick={handleDisconnect}
        >
          <Wallet className="mr-2 h-4 w-4" />
          Disconnect
        </Button>
      )}
    </div>
  );
};

export default DashboardPage;
