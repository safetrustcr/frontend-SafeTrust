"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChangeMilestoneStatus } from '@/components/tw-blocks/escrows/multi-release/change-milestone-status/ChangeMilestoneStatus';
import { CheckOutProcessProps, CheckOutData, DamageAssessment, MilestoneStatusData } from './types';
import { useGlobalAuthenticationStore } from '@/core/store/data';
import { useWalletContext } from '@/components/tw-blocks/wallet-kit/WalletProvider';
// import { updateBookingStatus, sendGuestNotification, initiateDispute } from '@/services/hotel.service';
// import { toast } from 'react-toastify';

export function CheckOutProcess({ booking, escrow, onSuccess, onError }: CheckOutProcessProps) {
  const { address } = useGlobalAuthenticationStore();
  const { walletAddress } = useWalletContext();
  const [checkOutData, setCheckOutData] = useState<CheckOutData>({
    checkOutTime: new Date().toISOString(),
    roomCondition: 'good',
    staffMember: address || '',
  });
  const [damageAssessment, setDamageAssessment] = useState<DamageAssessment>({
    hasDamage: false,
    condition: 'good',
    description: '',
  });

  const handleCheckOutCompletion = async (statusData: MilestoneStatusData) => {
    try {
      const finalStatus = damageAssessment.hasDamage ? 'disputed' : 'completed';
      
      // Update booking status - in a real app, this would be an API call
      // await updateBookingStatus(booking.id, 'checked_out', {
      //   checkOutTime: new Date().toISOString(),
      //   roomCondition: damageAssessment.condition,
      //   finalStatus,
      //   staffMember: checkOutData.staffMember
      // });

      if (damageAssessment.hasDamage) {
        // Initiate dispute process - in a real app, this would be an API call
        // await initiateDispute(escrow.contractId, damageAssessment);
        // await sendGuestNotification(booking.guestEmail, 'dispute_initiated', {
        //   bookingId: booking.id,
        //   reason: 'room_damage',
        //   description: damageAssessment.description,
        // });
        // toast.warning('Room damage detected. Dispute process initiated.');
      } else {
        // Send completion notification - in a real app, this would be an API call
        // await sendGuestNotification(booking.guestEmail, 'check_out_confirmed', {
        //   bookingId: booking.id,
        //   escrowStatus: 'completed',
        // });
        // toast.success('Check-out completed successfully! Guest has been notified.');
      }

      if (onSuccess) {
        onSuccess(statusData);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete check-out process';
      // toast.error(errorMessage);
      
      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      }
    }
  };

  const platformWallet = process.env.NEXT_PUBLIC_PLATFORM_WALLET || walletAddress || address || '';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guest Check-out - {booking.guestName}</CardTitle>
        <CardDescription>
          Complete check-out process and release remaining funds
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomCondition">Room Condition *</Label>
            <Select
              value={checkOutData.roomCondition}
              onValueChange={(value: 'excellent' | 'good' | 'fair' | 'poor') => {
                setCheckOutData({ ...checkOutData, roomCondition: value });
                setDamageAssessment({ ...damageAssessment, condition: value });
              }}
            >
              <SelectTrigger id="roomCondition">
                <SelectValue placeholder="Select room condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
            <Checkbox
              id="hasDamage"
              checked={damageAssessment.hasDamage}
              onCheckedChange={(checked) => 
                setDamageAssessment({ ...damageAssessment, hasDamage: checked === true })
              }
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="hasDamage" className="cursor-pointer">
                Room has damage
              </Label>
              <p className="text-sm text-muted-foreground">
                Check this box if there is any damage to the room that requires attention
              </p>
            </div>
          </div>

          {damageAssessment.hasDamage && (
            <div className="space-y-2">
              <Label htmlFor="damageDescription">Damage Description *</Label>
              <Textarea
                id="damageDescription"
                placeholder="Describe the damage in detail..."
                className="min-h-[100px]"
                value={damageAssessment.description}
                onChange={(e) => 
                  setDamageAssessment({ ...damageAssessment, description: e.target.value })
                }
              />
            </div>
          )}
        </div>
        
        <ChangeMilestoneStatus
          contractId={escrow.contractId}
          milestoneId={escrow.milestoneId || "check_out"}
          newStatus={damageAssessment.hasDamage ? "disputed" : "completed"}
          walletAddress={platformWallet}
          onSuccess={handleCheckOutCompletion}
          customMetadata={{
            bookingId: booking.id,
            checkOutTime: checkOutData.checkOutTime,
            roomCondition: damageAssessment.condition,
            hasDamage: damageAssessment.hasDamage,
            damageDescription: damageAssessment.description,
            staffApprover: checkOutData.staffMember
          }}
          confirmationMessage={
            damageAssessment.hasDamage 
              ? "Room damage detected. This will initiate a dispute process."
              : "Complete check-out and release remaining 30% of payment?"
          }
          evidence={damageAssessment.hasDamage ? JSON.stringify({
            condition: damageAssessment.condition,
            description: damageAssessment.description,
            hasDamage: true,
          }) : undefined}
          className="w-full"
          size="lg"
          variant={damageAssessment.hasDamage ? "destructive" : "default"}
        />
      </CardContent>
    </Card>
  );
}
