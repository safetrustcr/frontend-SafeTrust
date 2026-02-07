"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/auth/wallet/hooks/wallet.hook";
import { TransactionPreview } from "./TransactionPreview";
import { XDRSigningFlowProps } from "./types";
import { Loader2 } from "lucide-react";

export function XDRSigningFlow({
  escrowAction,
  onSuccess,
  onError,
  apiKey,
  network = "testnet"
}: XDRSigningFlowProps) {
  const { signXDR } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignAndSubmit = async (unsignedXDR: string) => {
    try {
      setIsLoading(true);
      
      const signedXDR = await signXDR(unsignedXDR);

      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const result = await fetch('/helper/send-transaction', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          signedXDR: signedXDR,
          network
        })
      });

      if (!result.ok) {
        throw new Error(`Transaction failed: ${result.statusText}`);
      }

      const transaction = await result.json();
      onSuccess(transaction);

    } catch (error) {
      console.error('XDR signing failed:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirm Transaction</CardTitle>
        <CardDescription>
          Please review and sign this transaction with your wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <TransactionPreview action={escrowAction} />
        <Button 
          onClick={() => handleSignAndSubmit(escrowAction.unsignedXDR)}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Processing..." : "Sign with Wallet"}
        </Button>
      </CardContent>
    </Card>
  );
}
