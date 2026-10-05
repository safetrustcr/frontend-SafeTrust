"use client"; // make sure this is a client component

import React from "react";
import { baseURL, TrustlessWorkConfig } from "@trustless-work/escrow";

import { clientEnv } from "@/config/env";

interface TrustlessWorkProviderProps {
  /**
   * Trustless Work API for the Stellar network the wallet kit signs on.
   * SafeTrust local modification: passed in by `EscrowProviders` instead of
   * picked from NODE_ENV, so a production build can't pair testnet
   * signatures with the mainnet API.
   */
  baseURL: baseURL;
  children: React.ReactNode;
}

export function TrustlessWorkProvider({
  baseURL,
  children,
}: TrustlessWorkProviderProps) {
  const apiKey =
    clientEnv.NEXT_PUBLIC_TRUSTLESS_API_KEY ||
    process.env.NEXT_PUBLIC_API_KEY ||
    "";
  return (
    <TrustlessWorkConfig baseURL={baseURL} apiKey={apiKey}>
      {children}
    </TrustlessWorkConfig>
  );
}
