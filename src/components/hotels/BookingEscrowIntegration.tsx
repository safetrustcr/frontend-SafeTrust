import { useQuery } from "@apollo/client";
import { useState } from "react";
import { HotelEscrowForm } from "./HotelEscrowForm";
import { useRouter } from "next/navigation";

export function BookingEscrowIntegration({ bookingId }: { bookingId: string }) {
  const { data: booking } = useQuery(['booking', bookingId], () => getBooking(bookingId));
  const [escrowCreated, setEscrowCreated] = useState(false);

  const router = useRouter();
  
  const handleEscrowCreated = async (escrowResponse: EscrowResponse) => {
    // Store escrow details in booking record
    await updateBookingWithEscrow(bookingId, {
      contractId: escrowResponse.contractId,
      escrowStatus: 'created',
      unsignedXDR: escrowResponse.unsignedXDR
    });
    
    setEscrowCreated(true);
    
    // Navigate to payment confirmation
    router.push(`/booking/${bookingId}/escrow-confirmation`);
  };

  if (!booking) return <LoadingSpinner />;
  
  if (escrowCreated) {
    return <EscrowConfirmationView bookingId={bookingId} />;
  }

  return (
    <TrustlessWorkProvider>
      <WalletProvider>
        <EscrowProvider>
          <HotelEscrowForm
            booking={booking}
            room={booking.room}
            hotel={booking.hotel}
            escrowType={booking.preferences.milestonePayments ? 'multi_release' : 'single_release'}
            onEscrowCreated={handleEscrowCreated}
          />
        </EscrowProvider>
      </WalletProvider>
    </TrustlessWorkProvider>
  );
}