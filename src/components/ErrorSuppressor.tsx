"use client";

import { useEffect } from "react";

export default function ErrorSuppressor() {
  useEffect(() => {
    // Suppress WalletConnect console errors globally
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      const message = args.join(" ");
      if (
        message.includes("Connection request reset") ||
        message.includes("walletconnect") ||
        message.includes("reown") ||
        message.includes("valtio") ||
        message.includes("ethereum-provider")
      ) {
        return; // Suppress these errors
      }
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.join(" ");
      if (
        message.includes("Connection request reset") ||
        message.includes("walletconnect") ||
        message.includes("reown") ||
        message.includes("valtio") ||
        message.includes("ethereum-provider")
      ) {
        return; // Suppress these warnings
      }
      originalWarn.apply(console, args);
    };

    // Also suppress unhandled promise rejections from WalletConnect
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.message?.includes("Connection request reset") ||
        event.reason?.message?.includes("walletconnect") ||
        event.reason?.message?.includes("reown") ||
        event.reason?.message?.includes("valtio")
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  return null;
}
