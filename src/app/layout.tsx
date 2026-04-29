import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../../public/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { ApolloClientProvider } from "@/providers/ApolloProviderWrapper";
import { QueryProvider } from "@/providers/QueryProvider";
import ErrorSuppressor from "@/components/ErrorSuppressor";
import { TrustlessWorkProvider as OldTrustlessWorkProvider } from "@/components/tw-blocks/providers/TrustlessWork";
import { TrustlessWorkProvider } from "@/lib/trustless-work";
import { WalletProvider } from "@/components/tw-blocks/wallet-kit/WalletProvider";
import { EscrowProvider } from "@/components/tw-blocks/providers/EscrowProvider";
import { EscrowDialogsProvider } from "@/components/tw-blocks/providers/EscrowDialogsProvider";
import { GraphQLDebugger } from "@/components/dev/GraphQLDebugger";
import { ErrorBoundaryWithCache } from "@/components/performance/ErrorBoundaryWithCache";
import { CacheWarmer } from "@/components/performance/CacheWarmer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SafeTrust",
  description: "SafeTrust is a decentralized and secure platform P2P",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
               (function() {
                 try {
                   var theme = localStorage.getItem('safetrust-theme');
                   var preferred = window.matchMedia('(prefers-color-scheme: dark)').matches
                     ? 'dark' : 'light';
                   var resolved = (theme === 'dark' || theme === 'light') ? theme : preferred;
                   if (resolved === 'dark') {
                     document.documentElement.classList.add('dark');
                   } else {
                     document.documentElement.classList.remove('dark');
                   }
                 } catch (e) {}
               })();
            `,
          }}
        />
      </head>
      <QueryProvider>
      <TrustlessWorkProvider>
        <WalletProvider>
          <EscrowProvider>
            <EscrowDialogsProvider>
              <ApolloClientProvider>
                <CacheWarmer />
                <body
                  className={`${geistSans.variable} ${geistMono.variable} antialiased`}
                >
                  <ErrorBoundaryWithCache>
                    <ErrorSuppressor />
                    {children}
                    <GraphQLDebugger />
                    <ToastContainer
                      position="top-right"
                      autoClose={3000}
                      hideProgressBar={false}
                      newestOnTop={false}
                      closeOnClick
                      rtl={false}
                      pauseOnFocusLoss
                      draggable
                      pauseOnHover
                    />
                  </ErrorBoundaryWithCache>
                </body>
              </ApolloClientProvider>
            </EscrowDialogsProvider>
          </EscrowProvider>
        </WalletProvider>
      </TrustlessWorkProvider>
      </QueryProvider>
    </html>
  );
}
