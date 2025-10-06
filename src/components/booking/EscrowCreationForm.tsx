// src/components/booking/EscrowCreationForm.tsx

import React from 'react';
import { useWallet } from '@/components/auth/wallet/hooks/wallet.hook';

// Import both escrow form blocks
import { InitializeEscrowForm as SingleReleaseForm } from '@/components/tw-blocks/escrows/single-release/initialize-escrow/form/InitializeEscrow';
import { InitializeEscrowForm as MultiReleaseForm } from '@/components/tw-blocks/escrows/multi-release/initialize-escrow/form/InitializeEscrow';

type EscrowType = 'single_release' | 'multi_release';

type EscrowCreationFormProps = {
  escrowType: EscrowType;
  bookingData: {
    id: string;
    roomId: string;
    hotelId: string;
    totalAmount: number;
    currency: string;
    checkInDate: string;
    checkOutDate: string;
    guestEmail: string;
  };
  hotelData: {
    name: string;
    walletAddress: string;
  };
  onEscrowCreated: (data: any) => void;
  onCancel: () => void;
};

export function EscrowCreationForm({
  escrowType,
  bookingData,
  hotelData,
  onEscrowCreated,
  onCancel
}: EscrowCreationFormProps) {
  const { address: walletAddress } = useWallet();

  if (!walletAddress) {
    return (
      <div>
        <p>⚠️ Please connect your wallet to create an escrow.</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const amountInStroops = (bookingData.totalAmount * 1e7).toString(); // Convert to stroops
  const assetCode = bookingData.currency || 'USDC';
  const assetIssuer = process.env.NEXT_PUBLIC_USDC_ISSUER!;
  const platformWallet = process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS!;

  const baseProps = {
    marker: hotelData.walletAddress,
    approver: walletAddress,
    releaser: platformWallet,
    amount: amountInStroops,
    asset: {
      code: assetCode,
      issuer: assetIssuer
    },
    metadata: {
      bookingId: bookingData.id,
      hotelId: bookingData.hotelId,
      hotelName: hotelData.name,
      checkInDate: bookingData.checkInDate,
      checkOutDate: bookingData.checkOutDate,
      guestEmail: bookingData.guestEmail,
      platform: 'SafeTrust',
      version: '1.0.0'
    },
    theme: 'safetrust',
    confirmationRequired: true,
    showAdvancedOptions: false,
    onSuccess: (data: any) => {
      console.log('✅ Escrow created!', data);
      onEscrowCreated(data);
    },
    onError: (err: any) => {
      console.error('❌ Escrow creation failed:', err);
      alert('Something went wrong while creating escrow.');
    },
    customValidation: (data: any) => {
      if (!data?.amount || Number(data.amount) <= 0) {
        return { error: 'Amount must be greater than 0' };
      }
      return { success: true };
    }
  };

  // For multi-release, add milestones inside metadata
  const milestones =
    escrowType === 'multi_release'
      ? [
          {
            description: 'Check-in milestone',
            amount: ((bookingData.totalAmount * 0.7) * 1e7).toString(),
            dueDate: bookingData.checkInDate,
            metadata: { step: 'check-in', percentage: 70 }
          },
          {
            description: 'Check-out milestone',
            amount: ((bookingData.totalAmount * 0.3) * 1e7).toString(),
            dueDate: bookingData.checkOutDate,
            metadata: { step: 'check-out', percentage: 30 }
          }
        ]
      : [];

  const updatedMetadata = {
    ...baseProps.metadata,
    milestones: milestones // Add milestones here
  };

  const updatedBaseProps = {
    ...baseProps,
    metadata: updatedMetadata
  };

  return (
    <div className="escrow-creation-form">
      <h2>🔐 Create Escrow for Booking</h2>
      {escrowType === 'multi_release' ? (
        <MultiReleaseForm {...updatedBaseProps as any} />
      ) : (
        <SingleReleaseForm {...baseProps as any} /> 
      )}
      <div style={{ marginTop: '1rem' }}>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
