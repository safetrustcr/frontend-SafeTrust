"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useWalletContext } from "@/components/tw-blocks/wallet-kit/WalletProvider";
import { useEscrowsBySignerQuery } from "@/components/tw-blocks/tanstack/useEscrowsBySignerQuery";

/**
 * Mirrors EscrowDashboard "Total Escrows" (useEscrowsBySignerQuery, active + validateOnChain).
 */
export function EscrowOverviewCard() {
  const { walletAddress } = useWalletContext();
  const signer = walletAddress ?? "";

  const { data: myEscrows = [], isLoading } = useEscrowsBySignerQuery({
    signer,
    enabled: !!signer,
    validateOnChain: true,
    isActive: true,
  });

  const total = myEscrows.length;

  const countDisplay = !signer ? (
    <span className="text-muted-foreground">—</span>
  ) : isLoading ? (
    <span className="text-muted-foreground">…</span>
  ) : (
    total
  );

  return (
    <div className="rounded-lg border p-4 bg-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">My Escrows</h3>
        <Link
          href="/dashboard/escrow-dashboard"
          className="text-sm text-primary hover:underline shrink-0"
        >
          View all escrows →
        </Link>
      </div>

      <div className="mb-3">
        <p className="text-3xl font-bold tabular-nums">{countDisplay}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Total escrows</p>
      </div>

      <p className="text-sm text-muted-foreground">
        Monitor escrows where you are approver, marker, or releaser.
      </p>
      <Button variant="outline" className="mt-3 w-full" asChild>
        <Link href="/dashboard/escrow-dashboard">Open Escrow Dashboard</Link>
      </Button>
    </div>
  );
}
