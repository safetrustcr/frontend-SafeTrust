"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ExternalLink, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { stellarExpertContractUrl } from "@/features/escrow/config";

export default function RentalEscrowReferencePage() {
  const { id, escrowId } = useParams<{ id: string; escrowId: string }>();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert aria-hidden="true" className="h-5 w-5 text-amber-600" />
            Escrow status is not verified here
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Live escrow status and billing details are not connected to this
            page yet. Check the contract on Stellar Expert for its current
            on-chain state; SafeTrust does not display a verified payment
            status here.
          </p>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Contract reference
            </p>
            <code className="break-all text-sm">{escrowId}</code>
          </div>
          <a
            href={stellarExpertContractUrl(escrowId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 underline dark:text-blue-400"
          >
            Verify contract on Stellar Expert
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
          </a>
          <div>
            <Link
              href={`/rent/${encodeURIComponent(id)}`}
              className="text-sm font-medium text-muted-foreground underline"
            >
              Back to rental
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
