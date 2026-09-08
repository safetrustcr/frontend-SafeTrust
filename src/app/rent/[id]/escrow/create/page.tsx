"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_APARTMENTS } from "@/lib/mockData/apartments";

export default function EscrowCreatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const apartment = MOCK_APARTMENTS.find((a) => a.id === id);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full rounded-xl border border-border bg-card p-8 text-center space-y-6 shadow-sm">

        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Lock className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold text-foreground">Booking Request Sent</h1>
          <p className="text-sm text-muted-foreground">Your escrow will be set up once the host confirms.</p>
        </div>

        <div className="rounded-lg bg-muted p-4 text-left space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Apartment</span>
            <span className="font-medium text-foreground max-w-[60%] text-right">
              {apartment?.name ?? "Selected apartment"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Warranty deposit</span>
            <span className="font-medium text-foreground">
              ${apartment?.warranty_deposit?.toLocaleString() ?? "2,400"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="text-yellow-600 dark:text-yellow-400 font-medium">Pending escrow setup</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground border border-dashed border-border rounded-lg p-3">
          ⚠ Escrow creation will be fully wired to TrustlessWork in a future release.
        </p>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => router.push("/rent")}>
            ← Back to browse
          </Button>
          <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white" onClick={() => router.push("/dashboard")}>
            Go to Dashboard →
          </Button>
        </div>
      </div>
    </div>
  );
}