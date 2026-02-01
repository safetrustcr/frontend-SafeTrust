/**
 * Booking Escrow Interfaces
 * Types for hotel booking escrow integration with Trustless Work
 */

export type EscrowType = 'single_release' | 'multi_release';

export interface BookingData {
  id: string;
  roomId: string;
  hotelId: string;
  totalAmount: number;
  currency: string;
  checkInDate: string;
  checkOutDate: string;
  guestEmail: string;
  guestName?: string;
  roomType?: string;
  cancellationPolicy?: string;
  preferences?: {
    milestonePayments?: boolean;
  };
}

export interface HotelData {
  id: string;
  name: string;
  walletAddress: string;
  rating?: number;
  location?: string;
  imageUrl?: string;
}

export interface RoomData {
  id: string;
  name: string;
  type: string;
  pricePerNight: number;
  capacity: number;
  amenities?: string[];
  imageUrl?: string;
}

export interface EscrowMilestone {
  description: string;
  amount: string;
  dueDate?: string;
  status?: 'pending' | 'completed' | 'disputed';
  metadata?: {
    type?: 'check_in' | 'check_out' | 'custom';
    percentage?: number;
  };
}

export interface EscrowAsset {
  code: string;
  issuer?: string;
}

export interface EscrowRoles {
  approver: string;
  serviceProvider: string;
  platformAddress: string;
  releaseSigner: string;
  disputeResolver: string;
  receiver: string;
}

export interface EscrowMetadata {
  bookingId: string;
  roomId: string;
  hotelId: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  guestEmail: string;
  platform: string;
  version: string;
  roomType?: string;
  cancellationPolicy?: string;
  milestones?: EscrowMilestone[];
}

export interface EscrowFormData {
  title: string;
  engagementId: string;
  description: string;
  amount: number | string;
  platformFee: number | string;
  roles: EscrowRoles;
  trustline: {
    address: string;
    decimals: number;
  };
  milestones: Array<{
    description: string;
    amount?: string;
  }>;
  receiverMemo?: string;
  metadata?: EscrowMetadata;
}

export interface EscrowResponse {
  contractId: string;
  unsignedXDR?: string;
  status: 'created' | 'pending' | 'active' | 'completed' | 'disputed' | 'cancelled';
  createdAt?: string;
  escrowAddress?: string;
}

export interface EscrowCreationFormProps {
  bookingData: BookingData;
  hotelData: HotelData;
  roomData?: RoomData;
  escrowType: EscrowType;
  onEscrowCreated: (escrowResponse: EscrowResponse) => void;
  onCancel: () => void;
  className?: string;
}

export interface BookingEscrowWrapperProps {
  bookingId: string;
  onComplete?: () => void;
}

export interface EscrowConfirmationProps {
  booking: BookingData;
  hotel: HotelData;
  escrowData: EscrowResponse;
  onComplete: () => void;
  onViewDetails?: () => void;
}

export interface UseBookingEscrowOptions {
  bookingData: BookingData;
  hotelData: HotelData;
  escrowType: EscrowType;
}

export interface UseBookingEscrowReturn {
  escrowFormData: EscrowFormData;
  milestones: EscrowMilestone[];
  totalAmount: number;
  amountInStroops: string;
  isValid: boolean;
  validationErrors: string[];
  calculateMilestoneAmounts: (total: number) => EscrowMilestone[];
}
