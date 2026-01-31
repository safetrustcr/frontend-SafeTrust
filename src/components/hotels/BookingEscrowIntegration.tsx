import { useState, useEffect } from "react";
import { HotelEscrowForm, BookingData, RoomData, HotelData } from "./HotelEscrowForm";
import { useRouter } from "next/navigation";

// Mock functions for now - these should be replaced with actual API calls
const getBooking = async (id: string): Promise<FullBookingData> => {
  // TODO: Implement actual booking fetch
  return { 
    id, 
    totalAmount: 100,
    checkInDate: new Date().toISOString(),
    checkOutDate: new Date().toISOString(),
    guestEmail: 'guest@example.com',
    cancellationPolicy: 'flexible',
    room: { id: 'room-1', type: 'Standard Room' }, 
    hotel: { id: 'hotel-1', walletAddress: 'G...' }, 
    preferences: { milestonePayments: true } 
  };
};

const updateBookingWithEscrow = async (id: string, data: unknown) => {
  // TODO: Implement actual update
  console.log('Updating booking', id, data);
};

interface EscrowResponse {
  contractId: string;
  unsignedXDR: string;
}

interface FullBookingData extends BookingData {
  room: RoomData;
  hotel: HotelData;
  preferences: { milestonePayments: boolean };
}

// Mock components
const LoadingSpinner = () => <div>Loading...</div>;
const EscrowConfirmationView = ({ bookingId }: { bookingId: string }) => <div>Escrow confirmed for {bookingId}</div>;
const TrustlessWorkProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const WalletProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const EscrowProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export function BookingEscrowIntegration({ bookingId }: { bookingId: string }) {
  const [booking, setBooking] = useState<FullBookingData | null>(null);
  const [escrowCreated, setEscrowCreated] = useState(false);
  const router = useRouter();

  // Fetch booking data on mount
  useEffect(() => {
    getBooking(bookingId).then(setBooking);
  }, [bookingId]);
  
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
