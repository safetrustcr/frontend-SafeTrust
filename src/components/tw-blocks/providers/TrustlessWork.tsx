"use client"; // make sure this is a client component

import React from "react";
import {
  baseURL,
  TrustlessWorkConfig,
} from "@trustless-work/escrow";

interface TrustlessWorkProviderProps {
  children: React.ReactNode;
}

export function TrustlessWorkProvider({
  children,
}: TrustlessWorkProviderProps) {
  /**
   * Get the API key from the environment variables
   */
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || "";
  const baseURL =
    (process.env.NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_TRUSTLESS_API_URL_DEV
      : process.env.NEXT_PUBLIC_TRUSTLESS_API_URL) as baseURL;
  return (
    <TrustlessWorkConfig baseURL={baseURL} apiKey={apiKey}>
      {children}
    </TrustlessWorkConfig>
  );
}
