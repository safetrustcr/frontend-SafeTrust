"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWallet } from "@/components/auth/wallet/hooks/wallet.hook";
import { TransactionPreview } from "./TransactionPreview";
import { XDRSigningFlowProps, TransactionResult } from "./types";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

export const XDRSigningFlow: React.FC<XDRSigningFlowProps> = ({
  escrowAction,
  onSuccess,
  onError,
  apiKey,
  network = "testnet"
}) => {
  const { signXDR, address, name } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<TransactionResult | null>(null);

  const handleSignAndSubmit = async () => {
    if (!address) {
      setError("No wallet connected. Please connect your wallet first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Sign XDR with connected wallet
      const signedXDR = await signXDR(escrowAction.unsignedXDR);

      // 2. Submit to Trustless Work API
      const response = await fetch('/helper/send-transaction', {
        method: 'POST',
        headers: {
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          signedXdr: signedXDR,
          network,
          returnEscrowDataIsRequired: escrowAction.type === 'deploy'
        })
      });

      if (!response.ok) {
        throw new Error(`Transaction failed: ${response.statusText}`);
      }

      // 3. Handle response
      const result = await response.json();

      const transactionResult: TransactionResult = {
        hash: result.hash || result.transactionHash,
        status: 'success',
        message: result.message || 'Transaction completed successfully',
        escrowData: result.escrowData || result.data
      };

      setSuccess(transactionResult);
      onSuccess(transactionResult);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('XDR signing failed:', error);
      setError(errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-600">Transaction Successful</CardTitle>
          </div>
          <CardDescription>
            Your transaction has been successfully submitted to the Stellar network.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-600">Transaction Hash</h4>
              <p className="text-xs font-mono bg-green-50 p-2 rounded break-all">
                {success.hash}
              </p>
            </div>
            {success.message && (
              <div>
                <h4 className="text-sm font-medium text-gray-600">Status</h4>
                <p className="text-sm">{success.message}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <TransactionPreview action={escrowAction} />

      <Card>
        <CardHeader>
          <CardTitle>Confirm Transaction</CardTitle>
          <CardDescription>
            Please review the transaction details above and sign with your wallet to proceed.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {address ? (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Connected Wallet</p>
                <p className="text-xs text-gray-600">
                  {name} • {address.slice(0, 8)}...{address.slice(-8)}
                </p>
              </div>
            </div>
          ) : (
            <Alert>
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
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleSignAndSubmit}
            disabled={!address || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing Transaction...
              </>
            ) : (
              'Sign with Wallet'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};