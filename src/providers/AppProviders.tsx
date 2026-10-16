"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "./AuthProvider";

/**
 * @deprecated Prefer using route group layouts with composable providers:
 * - (marketing)/layout.tsx: QueryProvider only
 * - (auth)/layout.tsx: AuthProvider
 * - (app)/layout.tsx: AuthProvider + QueryProvider
 * - (checkout)/layout.tsx: AuthProvider + QueryProvider + WalletProviderScoped + EscrowProviders
 *
 * Retained for backward compatibility with tests and isolated callers.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      storageKey="safetrust-theme"
      defaultTheme="system"
      enableSystem
    >
      <AuthProvider>
        <QueryProvider>
          {children}
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
