import { useSubscription } from "@apollo/client/react";
import { useRef } from "react";
import { toast } from "react-toastify";
import { ESCROW_STATUS_SUBSCRIPTION } from "@/graphql/subscriptions/escrow-subscriptions";
import type { EscrowStatusSubscription } from "@/graphql/types";

const TOAST_DEBOUNCE_MS = 3000;

export function useEscrowSubscription(escrowId: string) {
  const lastToastTime = useRef(0);

  const { data, loading, error } = useSubscription<EscrowStatusSubscription>(
    ESCROW_STATUS_SUBSCRIPTION,
    {
      variables: { escrowId },
      skip: !escrowId,
      onData: ({ data: subData }) => {
        const escrow = subData.data?.escrow_transactions_by_pk;
        if (!escrow) return;

        const now = Date.now();
        if (now - lastToastTime.current < TOAST_DEBOUNCE_MS) return;
        lastToastTime.current = now;

        toast.info(`Escrow status: ${escrow.status}`);
      },
      onError: (err) => {
        console.error("Escrow subscription error:", err);
        toast.error("Lost connection to live escrow updates");
      },
    },
  );

  return {
    escrow: data?.escrow_transactions_by_pk ?? null,
    loading,
    error,
  };
}
