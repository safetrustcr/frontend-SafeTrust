"use client";

import type { ReactNode } from "react";
import { TrustlessWorkProvider } from "@/components/tw-blocks/providers/TrustlessWork";
import { EscrowProvider } from "@/components/tw-blocks/providers/EscrowProvider";
import { TRUSTLESS_WORK_API_URL } from "@/features/escrow/config";

/** Scope Trustless Work to escrow features only. */
export function EscrowProviders({ children }: { children: ReactNode }) {
  return (
    <TrustlessWorkProvider baseURL={TRUSTLESS_WORK_API_URL}>
      <EscrowProvider>{children}</EscrowProvider>
    </TrustlessWorkProvider>
  );
}
