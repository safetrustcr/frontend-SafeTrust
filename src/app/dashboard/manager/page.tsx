"use client";

import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { EscrowOverviewCard } from "@/components/escrow/EscrowOverviewCard";
import { Wallet } from "lucide-react";
import { CacheStatus } from "@/components/performance/CacheStatus";
import GuestBookingsSummary from "@/components/dashboard/guest/GuestBookingsSummary";

const ManagerDashboardPage = () => {
  const { connect, disconnect } = useWallet();
  const { address } = useGlobalAuthenticationStore();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-xl font-semibold">Manager Dashboard</div>
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
              onClick={disconnect}
            >
              Disconnect
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">No wallet connected</p>
            <Button onClick={connect}>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </>
        )}
      </div>

      <EscrowOverviewCard />

      {/* Guest My Bookings Section */}
      <GuestBookingsSummary />
    </div>
  );
};

export default ManagerDashboardPage;
