"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEscrowSubscription } from "@/hooks/useEscrowSubscription";
import {
  EscrowBlockedView,
  EscrowNotesPanel,
  EscrowPaidView,
  EscrowReleasedView,
  getStubEscrow,
  getViewForStatus,
} from "@/components/escrow/views";

export default function HotelEscrowDetailPage() {
  const params = useParams<{ id: string; escrowId: string }>();
  const router = useRouter();
  const hotelId = params.id;
  const escrowId = params.escrowId;

  const stub = useMemo(() => getStubEscrow(escrowId), [escrowId]);
  const subscription = useEscrowSubscription(escrowId);

  const effectiveStatus = subscription.escrow?.status ?? stub.status;
  const view = getViewForStatus(effectiveStatus);
  const data = useMemo(
    () => ({ ...stub, status: effectiveStatus }),
    [stub, effectiveStatus],
  );

  useEffect(() => {
    if (view === "pending") {
      router.replace(`/hotel/${hotelId}/escrow/create`);
    }
  }, [view, hotelId, router]);

  if (view === "pending") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6 text-sm text-muted-foreground">
        Redirecting to escrow setup…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:items-start">
          <main className="min-w-0 rounded-xl border border-border bg-card p-6 shadow-sm">
            {view === "paid" && <EscrowPaidView data={data} />}
            {view === "blocked" && <EscrowBlockedView data={data} />}
            {view === "released" && <EscrowReleasedView data={data} />}
          </main>
          <EscrowNotesPanel escrowId={escrowId} subscription={subscription} />
        </div>
      </div>
    </div>
  );
}
