"use client";

import type { ReactNode } from "react";
import { TrustlessWorkProvider } from "@/components/tw-blocks/providers/TrustlessWork";
import { EscrowProvider } from "@/components/tw-blocks/providers/EscrowProvider";

/** Scope Trustless Work to escrow features only. */
export function EscrowProviders({ children }: { children: ReactNode }) {
  return (
    <TrustlessWorkProvider>
      <EscrowProvider>{children}</EscrowProvider>
    </TrustlessWorkProvider>
  );
}