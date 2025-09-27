"use client";

import * as React from "react";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
  useCallback,
} from "react";

export type AmountEscrowStore = {
  receiverAmount: number;
  platformFeeAmount: number;
  trustlessWorkAmount: number;
  receiverResolve: number;
  approverResolve: number;
  amountMoonpay: number;
  setAmounts: (totalAmount: number, platformFee: number) => void;
  setReceiverResolve: (value: number) => void;
  setApproverResolve: (value: number) => void;
  setAmountMoonpay: (value: number) => void;
};

const EscrowAmountContext = createContext<AmountEscrowStore | undefined>(
  undefined
);

export const EscrowAmountProvider = ({ children }: { children: ReactNode }) => {
  const [receiverAmount, setReceiverAmount] = useState(0);
  const [platformFeeAmount, setPlatformFeeAmount] = useState(0);
  const [trustlessWorkAmount, setTrustlessWorkAmount] = useState(0);
  const [receiverResolve, setReceiverResolve] = useState(0);
  const [approverResolve, setApproverResolve] = useState(0);
  const [amountMoonpay, setAmountMoonpay] = useState(0);

  const setAmounts: AmountEscrowStore["setAmounts"] = useCallback(
    (totalAmount, platformFee) => {
      // Trustless Work percentage
      const trustlessPercentage = 0.3;

      // Receiver percentage
      const receiverPercentage = 100 - (trustlessPercentage + platformFee);

      setReceiverAmount((totalAmount * receiverPercentage) / 100);
      setPlatformFeeAmount((totalAmount * platformFee) / 100);
      setTrustlessWorkAmount((totalAmount * trustlessPercentage) / 100);
    },
    []
  );

  const value = useMemo<AmountEscrowStore>(
    () => ({
      receiverAmount,
      platformFeeAmount,
      trustlessWorkAmount,
      receiverResolve,
      approverResolve,
      amountMoonpay,
      setAmounts,
      setReceiverResolve,
      setApproverResolve,
      setAmountMoonpay,
    }),
    [
      receiverAmount,
      platformFeeAmount,
      trustlessWorkAmount,
      receiverResolve,
      approverResolve,
      amountMoonpay,
    ]
  );

  return (
    <EscrowAmountContext.Provider value={value}>
      {children}
    </EscrowAmountContext.Provider>
  );
};

export function useEscrowAmountContext() {
  const ctx = useContext(EscrowAmountContext);
  if (!ctx) {
    throw new Error("useEscrowAmount must be used within EscrowAmountProvider");
  }
  return ctx;
}
