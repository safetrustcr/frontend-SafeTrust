"use client"; // make sure this is a client component

import React from "react";
import {
  baseURL,
  TrustlessWorkConfig,
} from "@trustless-work/escrow";

import { clientEnv } from "@/config/env";

interface TrustlessWorkProviderProps {
  children: React.ReactNode;
}

export function TrustlessWorkProvider({
  children,
}: TrustlessWorkProviderProps) {
  const apiKey = clientEnv.NEXT_PUBLIC_TRUSTLESS_API_KEY;
  const baseURL = clientEnv.NEXT_PUBLIC_TRUSTLESS_API_URL as baseURL;
  return (
    <TrustlessWorkConfig baseURL={baseURL} apiKey={apiKey}>
      {children}
    </TrustlessWorkConfig>
  );
}
