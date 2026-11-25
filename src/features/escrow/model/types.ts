export interface EscrowAction {
  unsignedXDR: string;
  type: "fund" | "release" | "approve" | "dispute" | "deploy";
  amount?: string;
  contractId?: string;
  description?: string;
  title?: string;
}

export interface TransactionResult {
  hash: string;
  status: "success" | "pending" | "failed";
  message?: string;
  escrowData?: unknown;
}

export interface XDRSigningFlowProps {
  escrowAction: EscrowAction;
  onSuccess: (result: TransactionResult) => void;
  onError?: (error: Error) => void;
  apiKey?: string;
  network?: "testnet" | "mainnet";
}

export interface TransactionPreviewProps {
  action: EscrowAction;
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
  contractId?: string;
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

// Escrow contract shape (was src/types/escrow-contract.ts).

interface Milestone {
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
  milestones: Milestone[];
  trustline: Trustline;
  receiverMemo?: number;
}
