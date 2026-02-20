import { useSubscription } from "@apollo/client";
import { PAYMENT_STATUS_SUBSCRIPTION } from "@/graphql/subscriptions/payment-subscriptions";
import { PaymentStatusUpdatesSubscription } from "@/graphql/types";
import { toast } from "react-toastify";
import { useRef } from "react";

export function usePaymentSubscription(escrowId: string | null) {
  const lastToastTime = useRef<number>(0);

  const { data, loading, error } = useSubscription<PaymentStatusUpdatesSubscription>(
    PAYMENT_STATUS_SUBSCRIPTION,
    {
      variables: { escrowId },
      skip: !escrowId,
      onData: ({ data: subscriptionData }) => {
        const payments = subscriptionData.data?.payment_transactions;
        if (payments && payments.length > 0) {
          const latestPayment = payments[0];
          const now = Date.now();
          // Debounce toasts (3 seconds) to prevent spam
          if (now - lastToastTime.current > 3000) {
            toast.success(`Payment Update: ${latestPayment.status}`);
            lastToastTime.current = now;
          }
        }
      },
      onError: (err) => {
        console.error("Payment subscription error:", err);
      },
    }
  );

  return { 
    payments: data?.payment_transactions || [], 
    loading, 
    error 
  };
}
