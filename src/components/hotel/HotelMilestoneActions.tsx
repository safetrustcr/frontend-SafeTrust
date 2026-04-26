"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckInApproval } from './CheckInApproval';
import { CheckOutProcess } from './CheckOutProcess';
import { Booking, EscrowMetadata } from './types';
import { EscrowData } from '@/components/dashboard/EscrowDashboard';

interface HotelMilestoneActionsProps {
  escrow: EscrowData;
  userRole: 'guest' | 'hotel' | 'admin';
  onComplete?: () => void;
}

export function HotelMilestoneActions({ escrow, userRole, onComplete }: HotelMilestoneActionsProps) {
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);

  // Convert escrow metadata to booking format
  const booking: Booking = {
    id: escrow.metadata?.bookingId || escrow.id,
    guestName: escrow.metadata?.guestName || 'Guest',
    guestEmail: escrow.metadata?.guestEmail || '',
    checkInDate: escrow.metadata?.checkInDate || '',
    checkOutDate: escrow.metadata?.checkOutDate || '',
    roomNumber: escrow.metadata?.roomNumber,
    status: escrow.status === 'funded' ? 'pending' :
           escrow.status === 'check_in_approved' ? 'checked_in' :
           escrow.status === 'check_out_approved' || escrow.status === 'completed' ? 'checked_out' :
           escrow.status === 'cancelled' ? 'cancelled' : 'pending',
  };

  const escrowMetadata: EscrowMetadata = {
    bookingId: booking.id,
    hotelName: escrow.metadata?.hotelName || 'Hotel',
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    ...(escrow.metadata || {}),
  };

  const handleCheckInSuccess = () => {
    setIsCheckInOpen(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleCheckOutSuccess = () => {
    setIsCheckOutOpen(false);
    if (onComplete) {
      onComplete();
    }
  };

  // Determine which action to show
  const showCheckIn = userRole === 'hotel' && escrow.status === 'funded' && escrow.nextMilestone === 'check_in';
  const showCheckOut = (userRole === 'hotel' || userRole === 'admin') && 
                       escrow.status === 'check_in_approved' && 
                       escrow.nextMilestone === 'check_out';

  if (!showCheckIn && !showCheckOut) {
    return null;
  }

  return (
    <>
      {showCheckIn && (
        <>
          <button
            onClick={() => setIsCheckInOpen(true)}
            className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Process Check-in
          </button>
          <Dialog open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Guest Check-in Process</DialogTitle>
              </DialogHeader>
              <CheckInApproval
                booking={booking}
                escrow={{
                  contractId: escrow.contractId,
                  milestoneId: '0', // Check-in is typically the first milestone
                  metadata: escrowMetadata,
                }}
                onSuccess={handleCheckInSuccess}
              />
            </DialogContent>
          </Dialog>
        </>
      )}

      {showCheckOut && (
        <>
          <button
            onClick={() => setIsCheckOutOpen(true)}
            className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Process Check-out
          </button>
          <Dialog open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Guest Check-out Process</DialogTitle>
              </DialogHeader>
              <CheckOutProcess
                booking={booking}
                escrow={{
                  contractId: escrow.contractId,
                  milestoneId: '1', // Check-out is typically the second milestone
                  metadata: escrowMetadata,
                }}
                onSuccess={handleCheckOutSuccess}
              />
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
}
