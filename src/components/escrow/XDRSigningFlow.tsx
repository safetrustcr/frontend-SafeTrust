"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWallet } from "@/components/auth/wallet/hooks/wallet.hook";
import { TransactionPreview } from "./TransactionPreview";
import { XDRSigningFlowProps, TransactionResult } from "./types";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit";

export function XDRSigningFlow({
  escrowAction,
  onSuccess,
  onError,
  apiKey,
  network = "testnet"
}: XDRSigningFlowProps) {
  const { signXDR, address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<TransactionResult | null>(null);

  const handleSignAndSubmit = async (unsignedXDR: string) => {
    if (!address) {
      setError("No wallet connected. Please connect your wallet first.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const networkPassphrase = network === 'mainnet' 
        ? WalletNetwork.PUBLIC 
        : WalletNetwork.TESTNET;

      const signedXDR = await signXDR(unsignedXDR, networkPassphrase);

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
      
      const transactionResult: TransactionResult = {
        hash: transaction.hash ?? transaction.result?.hash ?? transaction.transactionHash ?? transaction.txHash ?? transaction.id,
        status: 'success',
        message: transaction.message || 'Transaction completed successfully',
        escrowData: transaction.escrowData || transaction.data,
        ...transaction
      };

      setSuccess(transactionResult);
      onSuccess(transactionResult);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('XDR signing failed:', error);
      setError(errorMessage);
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-600">Transaction Successful</CardTitle>
          </div>
          <CardDescription>
            Your transaction has been successfully submitted to the Stellar network.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-600">Transaction Hash</h4>
            <p className="text-xs font-mono bg-white p-2 rounded border border-green-100 break-all select-all">
              {success.hash}
            </p>
          </div>
          {success.message && (
            <p className="text-sm text-gray-600">{success.message}</p>
          )}
        </CardContent>
      </Card>
    );
  }

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

        {!address && (
           <Alert variant="destructive">
             <AlertCircle className="h-4 w-4" />
             <AlertDescription>
               Please connect your wallet to sign this transaction.
             </AlertDescription>
           </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={() => handleSignAndSubmit(escrowAction.unsignedXDR)}
          disabled={isLoading || !address}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Sign with Wallet"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
