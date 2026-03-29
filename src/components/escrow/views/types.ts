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

/** Stub shape until GET_ESCROW_BY_ID is wired */
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
