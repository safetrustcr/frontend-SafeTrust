"use client";

import { useEffect, type ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { initSessionListener } from "@/lib/auth/session";
import { QueryProvider } from "./QueryProvider";

/**
 * Global providers that are safe to include on every page.
 *
 * WalletProvider has been intentionally removed from here:
 * it pulls in @creit.tech/stellar-wallets-kit (~250 kB) which adds to
 * every route's first-load JS, including public pages like /, /rent and
 * /room that never need a wallet.
 *
 * The wallet kit is now loaded on-demand:
 *  - Auth pages (/login, /register) render WalletProvider themselves.
 *  - Escrow pages (/bookings/**) get it through EscrowProviders.
 *  - Dashboard pages (/dashboard/**) get it from the dashboard layout.
 *
 * See: https://github.com/safetrustcr/frontend-SafeTrust/issues/538
 */
export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    const unsubscribe = initSessionListener();
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryProvider>
        {children}
        <Toaster richColors position="top-right" />
      </QueryProvider>
    </ThemeProvider>
  );
}
