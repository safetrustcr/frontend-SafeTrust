export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  roomNumber?: string;
  status: 'pending' | 'checked_in' | 'checked_out' | 'completed' | 'cancelled';
}

export interface CheckInData {
  roomNumber: string;
  checkInTime: string;
  wifiPassword?: string;
  signature?: string;
  staffMember?: string;
}

export interface CheckOutData {
  checkOutTime: string;
  staffMember?: string;
  roomCondition?: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface DamageAssessment {
  hasDamage: boolean;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  description?: string;
  damagePhotos?: string[];
}

export interface MilestoneApprovalData {
  contractId: string;
  milestoneId: string;
  bookingId: string;
  timestamp: string;
}

export interface MilestoneStatusData {
  contractId: string;
  milestoneId: string;
  newStatus: string;
  bookingId: string;
  timestamp: string;
}

export interface EscrowMetadata {
  bookingId: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  guestName?: string;
  guestEmail?: string;
  roomNumber?: string;
  checkInTime?: string;
  checkOutTime?: string;
  staffApprover?: string;
  hasDamage?: boolean;
  damageDescription?: string;
}

export interface CheckInApprovalProps {
  booking: Booking;
  escrow: {
    contractId: string;
    milestoneId?: string;
    metadata?: EscrowMetadata;
  };
  onSuccess?: (data: MilestoneApprovalData) => void;
  onError?: (error: Error) => void;
}

export interface CheckOutProcessProps {
  booking: Booking;
  escrow: {
    contractId: string;
    milestoneId?: string;
    metadata?: EscrowMetadata;
  };
  onSuccess?: (data: MilestoneStatusData) => void;
  onError?: (error: Error) => void;
}
