"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApproveMilestone } from '@/components/tw-blocks/escrows/multi-release/approve-milestone/ApproveMilestone';
import { CheckInApprovalProps, CheckInData, MilestoneApprovalData } from './types';
import { useGlobalAuthenticationStore } from '@/core/store/data';
import { useWalletContext } from '@/components/tw-blocks/wallet-kit/WalletProvider';
// import { updateBookingStatus, sendGuestNotification } from '@/services/hotel.service';
// import { toast } from 'react-toastify';

export function CheckInApproval({ booking, escrow, onSuccess, onError }: CheckInApprovalProps) {
  const { address } = useGlobalAuthenticationStore();
  const { walletAddress } = useWalletContext();
  const [checkInData, setCheckInData] = useState<CheckInData>({
    roomNumber: '',
    checkInTime: new Date().toISOString(),
    wifiPassword: '',
    signature: '',
    staffMember: address || '',
  });

  const handleMilestoneApproval = async (approvalData: MilestoneApprovalData) => {
    try {
      // Update booking status - in a real app, this would be an API call
      // await updateBookingStatus(booking.id, 'checked_in', {
      //   checkInTime: new Date().toISOString(),
      //   staffMember: address || '',
      //   roomAssigned: checkInData.roomNumber,
      //   roomNumber: checkInData.roomNumber,
      //   guestSignature: checkInData.signature
      // });

      // Send notification to guest - in a real app, this would be an API call
      // await sendGuestNotification(booking.guestEmail, 'check_in_confirmed', {
      //   roomNumber: checkInData.roomNumber,
      //   wifiPassword: checkInData.wifiPassword,
      //   escrowStatus: 'milestone_approved'
      // });

      // toast.success('Check-in completed and guest notified successfully');

      if (onSuccess) {
        onSuccess(approvalData);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete check-in process';
      // toast.error(errorMessage);
      
      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      }
    }
  };

  const isFormValid = checkInData.roomNumber.trim().length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guest Check-in - {booking.guestName}</CardTitle>
        <CardDescription>
          Approve check-in milestone to release 70% of escrowed funds
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomNumber">Room Number *</Label>
            <Input
              id="roomNumber"
              placeholder="e.g., 101, 205"
              value={checkInData.roomNumber}
              onChange={(e) => setCheckInData({ ...checkInData, roomNumber: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wifiPassword">WiFi Password (Optional)</Label>
            <Input
              id="wifiPassword"
              type="password"
              placeholder="Enter WiFi password"
              value={checkInData.wifiPassword}
              onChange={(e) => setCheckInData({ ...checkInData, wifiPassword: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature">Guest Signature (Optional)</Label>
            <Input
              id="signature"
              placeholder="Guest signature or initials"
              value={checkInData.signature}
              onChange={(e) => setCheckInData({ ...checkInData, signature: e.target.value })}
            />
          </div>
        </div>
        
        {isFormValid && (
          <ApproveMilestone
            contractId={escrow.contractId}
            milestoneId={escrow.milestoneId || "check_in"}
            approverWallet={walletAddress || address || ''}
            onSuccess={handleMilestoneApproval}
            customMetadata={{
              bookingId: booking.id,
              roomNumber: checkInData.roomNumber,
              checkInTime: checkInData.checkInTime,
              staffApprover: address || ''
            }}
            confirmationMessage="This will release 70% of the guest's payment. Confirm check-in completion?"
            className="w-full"
            size="lg"
          />
        )}
      </CardContent>
    </Card>
  );
}
