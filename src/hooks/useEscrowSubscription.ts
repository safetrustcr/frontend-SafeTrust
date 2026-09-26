"use client";

import { useEffect, useState } from "react";
import { getMockEscrowStatus, type EscrowStatusSnapshot } from "@/lib/mockData/escrows";

export type EscrowSubscriptionResult = {
  escrow: EscrowStatusSnapshot | null;
  loading: boolean;
  error: Error | undefined;
};

/**
 * Skeleton-mode stand-in for the Hasura `EscrowStatusUpdates` subscription.
 * Returns a mock escrow snapshot associated with the current escrowId after a 300ms delay.
 * dApp-SafeTrust replaces this body with Apollo `useSubscription` (see docs/INTEGRATION_ROADMAP.md).
 *
 * @param escrowId - Unique identifier of the escrow transaction to subscribe to.
 * @param options - Configuration options, including `skip` to bypass subscription.
 * @returns EscrowSubscriptionResult containing `{ escrow, loading, error }`.
 */
export function useEscrowSubscription(
  escrowId: string,
  options?: { skip?: boolean },
): EscrowSubscriptionResult {
  const skip = Boolean(options?.skip) || !escrowId;
  const [snapshot, setSnapshot] = useState<{ id: string; data: EscrowStatusSnapshot } | null>(null);

  useEffect(() => {
    if (skip) return;
    const t = setTimeout(() => {
      setSnapshot({ id: escrowId, data: getMockEscrowStatus(escrowId) });
    }, 300);
    return () => clearTimeout(t);
  }, [escrowId, skip]);

  const currentEscrow = !skip && snapshot?.id === escrowId ? snapshot.data : null;
  const loading = !skip && currentEscrow === null;

  return { escrow: currentEscrow, loading, error: undefined };
}
