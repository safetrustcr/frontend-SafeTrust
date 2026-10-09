import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { DemoBanner } from "@/components/layouts/DemoBanner";
import { AppProviders } from "@/providers/AppProviders";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "SafeTrust: stays protected by escrow",
    template: "%s · SafeTrust",
  },
  description:
    "Book apartments and hotels in Costa Rica with your deposit held in a Stellar escrow until check-out.",
  applicationName: "SafeTrust",
  openGraph: { type: "website", siteName: "SafeTrust", locale: "en_US" },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/img/logo.png", apple: "/img/logo.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020817" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AppProviders>
          <DemoBanner />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}