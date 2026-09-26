"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { ApolloClientProvider } from "@/providers/ApolloProviderWrapper";
import { WalletProvider } from "@/components/tw-blocks/wallet-kit/WalletProvider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "./QueryProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ApolloClientProvider>
        <QueryProvider>
          <WalletProvider>
            {children}
            <Toaster richColors position="top-right" />
          </WalletProvider>
        </QueryProvider>
      </ApolloClientProvider>
    </ThemeProvider>
  );
}