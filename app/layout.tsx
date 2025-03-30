'use client';
import React from 'react';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from '@material-tailwind/react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import '../src/i18n/config';
import { ClientProviders } from '@/providers/ClientProviders';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-inter" suppressHydrationWarning={true}>
        <div className="min-h-screen flex flex-col">
          <ThemeProvider>
            <NextThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
            >
              <ClientProviders>
                <main className="flex-1">{children}</main>
              </ClientProviders>
            </NextThemeProvider>
          </ThemeProvider>
        </div>
        <ToastContainer position="top-right" />
      </body>
    </html>
  );
}
