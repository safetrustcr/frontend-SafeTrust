import { useSubscription } from "@apollo/client";
import { useRef } from "react";
import { toast } from "react-toastify";
import { PAYMENT_STATUS_SUBSCRIPTION } from "@/graphql/subscriptions/payment-subscriptions";
import type { PaymentStatusSubscription } from "@/graphql/types";

const TOAST_DEBOUNCE_MS = 3000;

export function usePaymentSubscription(escrowUserId: string) {
  const lastToastTime = useRef(0);

  const { data, loading, error } = useSubscription<PaymentStatusSubscription>(
    PAYMENT_STATUS_SUBSCRIPTION,
    {
      variables: { escrowUserId },
      skip: !escrowUserId,
      onData: ({ data: subData }) => {
        const payment = subData.data?.escrow_transaction_users_by_pk;
        if (!payment) return;

        const now = Date.now();
        if (now - lastToastTime.current < TOAST_DEBOUNCE_MS) return;
        lastToastTime.current = now;

        toast.info(`Payment: ${payment.funding_status}`);
      },
      onError: (err) => {
        console.error("Payment subscription error:", err);
        toast.error("Lost connection to live payment updates");
      },
    },
  );

  return {
    payment: data?.escrow_transaction_users_by_pk ?? null,
    loading,
    error,
  };
}
