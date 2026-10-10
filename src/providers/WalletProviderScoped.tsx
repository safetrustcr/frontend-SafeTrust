"use client";

import type { ReactNode } from "react";
import { WalletProvider } from "@/components/tw-blocks/wallet-kit/WalletProvider";

/**
 * Scoped wallet provider for auth and escrow pages.
 *
 * Wrap only the subtrees that actually need the wallet context so that
 * @creit.tech/stellar-wallets-kit is not bundled into public routes.
 */
export function WalletProviderScoped({ children }: { children: ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}
