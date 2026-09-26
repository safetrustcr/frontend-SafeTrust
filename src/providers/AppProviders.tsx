"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { WalletProvider } from "@/components/tw-blocks/wallet-kit/WalletProvider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "./QueryProvider";

/**
 * Root client-side providers wrapper component.
 * Composes Theme, React Query, and Wallet providers for the application tree.
 *
 * @param props - Component props containing children to be wrapped by client providers.
 * @returns React component wrapping children in client provider contexts.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryProvider>
        <WalletProvider>
          {children}
          <Toaster richColors position="top-right" />
        </WalletProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}