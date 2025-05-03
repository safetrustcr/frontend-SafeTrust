import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../../public/styles/globals.css";
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { ToastContainer } from "react-toastify";

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          {children}
        </NextThemeProvider>
        <ToastContainer position="top-right" />
      </body>
    </html>
  );
}