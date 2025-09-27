import { InitializeEscrowForm } from '@/components/tw-blocks/escrows/single-release/initialize-escrow/form/InitializeEscrowForm';
import { InitializeEscrowForm as MultiReleaseForm } from '@/components/tw-blocks/escrows/multi-release/initialize-escrow/form/InitializeEscrowForm';
import { useWallet } from '../auth/wallet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export interface HotelBookingEscrowProps {
  booking: BookingData;
  room: RoomData;
  hotel: HotelData;
  escrowType: 'single_release' | 'multi_release';
  onEscrowCreated: (escrow: EscrowResponse) => void;
}

export function HotelEscrowForm({ booking, room, hotel, escrowType, onEscrowCreated }: HotelBookingEscrowProps) {
  const { address: guestWallet } = useWallet();
  
  const escrowData = {
    marker: hotel.walletAddress,
    approver: guestWallet,
    releaser: process.env.NEXT_PUBLIC_PLATFORM_WALLET,
    amount: (booking.totalAmount * 10000000).toString(), // Convert to stroops
    asset: { code: 'USDC' },
    metadata: {
      bookingId: booking.id,
      roomId: room.id,
      hotelId: hotel.id,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      guestEmail: booking.guestEmail,
      roomType: room.type,
      cancellationPolicy: booking.cancellationPolicy
    }
  };

  const milestones = escrowType === 'multi_release' ? [
    {
      description: "Check-in milestone - Room access granted",
      amount: (booking.totalAmount * 0.7 * 10000000).toString(), // 70% on check-in
      dueDate: booking.checkInDate
    },
    {
      description: "Check-out milestone - Stay completed successfully", 
      amount: (booking.totalAmount * 0.3 * 10000000).toString(), // 30% on check-out
      dueDate: booking.checkOutDate
    }
  ] : undefined;

  if (escrowType === 'single_release') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Secure Your Booking with Escrow</CardTitle>
          <CardDescription>
            Your payment will be held securely until check-out completion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InitializeEscrowForm
            defaultValues={escrowData}
            onSuccess={onEscrowCreated}
            customValidation={validateHotelBooking}
            showAdvancedOptions={false}
            theme="hotel"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Milestone-Based Booking Protection</CardTitle>
        <CardDescription>
          Payment released in stages: check-in and check-out completion
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MultiReleaseForm
          defaultValues={{ ...escrowData, milestones }}
          onSuccess={onEscrowCreated}
          customValidation={validateHotelBooking}
          showMilestonePreview={true}
          theme="hotel"
        />
      </CardContent>
    </Card>
  );
}