"use client";

import React from "react";
import { XDRSigningFlow } from "./XDRSigningFlow";
import { EscrowAction, TransactionResult } from "./types";

// Example usage component - can be removed in production
export const XDRSigningFlowExample: React.FC = () => {
  // Example escrow action - this would come from your app's state/API
  const exampleAction: EscrowAction = {
    type: 'fund',
    unsignedXDR: 'AAAAAgAAAAB...[example_xdr_here]...==',
    amount: '100.00',
    title: 'Hotel Room Reservation',
    description: 'Funding escrow for 3-night stay at Grand Hotel',
    contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQAHHAGHI6Qa'
  };

  const handleSuccess = (result: TransactionResult) => {
    console.log('Transaction successful:', result);
    // Handle successful transaction (e.g., redirect, update UI, etc.)
  };

  const handleError = (error: Error) => {
    console.error('Transaction failed:', error);
    // Handle error (e.g., show error message, log error, etc.)
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">XDR Signing Flow Example</h1>

      <XDRSigningFlow
        escrowAction={exampleAction}
        onSuccess={handleSuccess}
        onError={handleError}
        network="testnet"
      />
    </div>
  );
};