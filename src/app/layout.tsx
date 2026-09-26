import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TrustlessWorkProvider } from "@/providers/TrustlessWorkProvider";
import { Toaster } from "@/components/ui/sonner"

import "./globals.css";

import { ClientProviders } from "@/providers/ClientProviders";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SafeTrust",
  description: "Decentralized P2P Escrow on Stellar Blockchain",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientProviders>
            <TrustlessWorkProvider>
              {children}
              <Toaster richColors position="top-right" />
            </TrustlessWorkProvider>
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}