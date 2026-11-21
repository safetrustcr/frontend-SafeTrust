"use client";

import * as React from "react";
import { Send, Shield, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatEscrowAmount } from "@/lib/format";
import { stellarExpertContractUrl } from "../config";
import { cn } from "@/lib/utils";

export interface ApprovedEscrowItem {
  id: string;
  contractId?: string;
  listingName: string;
  amount: number;
  currency?: string;
  guestAddress: string;
  hostAddress: string;
  approvedAt: string;
}

export interface PlatformReleasesViewProps {
  escrows: ApprovedEscrowItem[];
  onRelease: (escrow: ApprovedEscrowItem) => void;
  isReleasingId?: string | null;
  className?: string;
}

export function PlatformReleasesView({
  escrows,
  onRelease,
  isReleasingId,
  className,
}: PlatformReleasesViewProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card p-6 space-y-6 shadow-sm",
        className,
      )}
      aria-label="Platform releases table"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-bold text-foreground">
              Platform Releases (Option A)
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Admin screen listing guest-approved escrows queued for platform
            wallet release.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary w-fit">
          {escrows.length} pending{" "}
          {escrows.length === 1 ? "release" : "releases"}
        </span>
      </div>

      {escrows.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <CheckCircle2 className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
          <p className="font-medium text-foreground text-sm">
            All approved escrows have been released
          </p>
          <p className="text-xs text-muted-foreground">
            When guests approve stays under Option A, they will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="pb-3 font-medium">Listing & Escrow</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium hidden md:table-cell">Guest</th>
                <th className="pb-3 font-medium hidden sm:table-cell">
                  Host (Recipient)
                </th>
                <th className="pb-3 font-medium hidden lg:table-cell">
                  Approved Date
                </th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {escrows.map((escrow) => {
                const currency = escrow.currency ?? "USDC";
                const isReleasing = isReleasingId === escrow.id;

                return (
                  <tr
                    key={escrow.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 pr-3">
                      <p className="font-semibold text-foreground">
                        {escrow.listingName}
                      </p>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="font-mono text-xs text-muted-foreground">
                          {escrow.id.slice(0, 10)}…
                        </span>
                        {escrow.contractId && (
                          <a
                            href={stellarExpertContractUrl(escrow.contractId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:opacity-80"
                            title="View contract on stellar.expert"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span className="sr-only">(opens in new tab)</span>
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-4 pr-3 font-mono font-bold text-foreground whitespace-nowrap">
                      {formatEscrowAmount(escrow.amount, currency)}
                    </td>
                    <td className="py-4 pr-3 font-mono text-xs text-muted-foreground hidden md:table-cell whitespace-nowrap">
                      {escrow.guestAddress.slice(0, 4)}…
                      {escrow.guestAddress.slice(-4)}
                    </td>
                    <td className="py-4 pr-3 font-mono text-xs text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                      {escrow.hostAddress.slice(0, 4)}…
                      {escrow.hostAddress.slice(-4)}
                    </td>
                    <td className="py-4 pr-3 text-xs text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                      {escrow.approvedAt}
                    </td>
                    <td className="py-4 text-right whitespace-nowrap">
                      <Button
                        type="button"
                        size="sm"
                        disabled={isReleasing}
                        onClick={() => onRelease(escrow)}
                        className="rounded-xl font-medium"
                      >
                        <Send className="h-3.5 w-3.5 mr-1.5" />
                        Release funds
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
