import { useSubscription } from "@apollo/client";
import { ESCROW_STATUS_SUBSCRIPTION } from "@/graphql/subscriptions/escrow-subscriptions";
import { EscrowStatusUpdatesSubscription } from "@/graphql/types";
import { toast } from "react-toastify";
import { useRef } from "react";

export function useEscrowSubscription(escrowId: string | null) {
  const lastToastTime = useRef<number>(0);

  const { data, loading, error } = useSubscription<EscrowStatusUpdatesSubscription>(
    ESCROW_STATUS_SUBSCRIPTION,
    {
      variables: { escrowId },
      skip: !escrowId,
      onData: ({ data: subscriptionData }) => {
        const escrow = subscriptionData.data?.escrow_transactions_by_pk;
        if (escrow) {
          const now = Date.now();
          // Debounce toasts (3 seconds) to prevent spam
          if (now - lastToastTime.current > 3000) {
            toast.info(`Escrow Status Updated: ${escrow.status}`);
            lastToastTime.current = now;
          }
        }
      },
      onError: (err) => {
        console.error("Escrow subscription error:", err);
      },
    }
  );

  return { 
    escrow: data?.escrow_transactions_by_pk, 
    loading, 
    error 
  };
}
