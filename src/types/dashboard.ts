export type EscrowStatus =
  | "pending"
  | "funded"
  | "check_in_approved"
  | "check_out_approved"
  | "completed"
  | "cancelled";

export interface EscrowData {
  id: string;
  contractId: string;
  status: EscrowStatus;
  amount: number;
  asset: {
    code: string;
    issuer?: string;
  };
  metadata?: {
    bookingId: string;
    hotelName: string;
    checkInDate: string;
    checkOutDate: string;
    guestName?: string;
    guestEmail?: string;
    roomNumber?: string;
  };
  nextMilestone?: string;
  milestones?: Milestone[];
  marker: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationData {
  id: string;
  type: "milestone" | "payment" | "alert";
  message: string;
  timestamp: string;
  read: boolean;
  escrowId?: string;
}

export interface Milestone {
  id: string;
  name: string;
  status: "pending" | "in_progress" | "completed" | "rejected";
  dueDate?: string;
  completedAt?: string;
}
