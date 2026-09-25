interface EscrowContractMilestone {
    description: string;
    amount?: number;
    receiver?: string;
  }

  interface Roles {
    approver: string;
    serviceProvider: string;
    platformAddress: string;
    releaseSigner: string;
    disputeResolver: string;
    receiver: string;
  }

  interface Trustline {
    address: string;
    decimals: number;
    symbol?: string;
  }

  export interface EscrowContract {
    signer: string;
    engagementId: string;
    title: string;
    description: string;
    roles: Roles;
    amount: number;
    platformFee: number;
    milestones: EscrowContractMilestone[];
    trustline: Trustline;
    receiverMemo?: number;
  }

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
  asset: { code: string; issuer?: string };
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

export type StubEscrowParty = {
  name: string;
  wallet: string;
  email: string;
};

export type StubEscrowTenant = StubEscrowParty & {
  rentalDate: string;
  depositAmount: string;
};

export type StubEscrowBeneficiary = StubEscrowParty & {
  releasedDate: string;
  depositAmount: string;
  phone: string;
};

export type StubEscrowProductRow = {
  product: string;
  pricePerMonth: string;
  deposit: string;
};

export type StubEscrowDetail = {
  id: string;
  invoiceNumber: string;
  status: string;
  createdAt: string;
  amount: number;
  paymentBatchTitle: string;
  subject: string;
  currency: string;
  issued: string;
  dueDate: string;
  notes: string;
  billedTo: string;
  billingDetails: string;
  products: StubEscrowProductRow[];
  subtotal: string;
  discount: string;
  total: string;
  terms: string;
  tenant: StubEscrowTenant;
  owner: StubEscrowParty;
  beneficiary: StubEscrowBeneficiary;
  escrowJustification: string;
  claimsPlaceholder: string;
  apartment: { name: string; image: string };
};

