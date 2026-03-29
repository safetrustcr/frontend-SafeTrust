import type { StubEscrowDetail } from "./types";

// TODO: replace with useQuery(GET_ESCROW_BY_ID) in GraphQL wiring issue
export function getStubEscrow(escrowId: string): StubEscrowDetail {
  return {
    id: escrowId,
    invoiceNumber: "INV4257-09-012",
    // Safe fallback when subscription has no row yet (maps to pending → redirect).
    // Override locally (e.g. "funded") to demo views without backend.
    status: "unknown",
    createdAt: "2025-01-25",
    amount: 4000,
    paymentBatchTitle: "Payment batch — January 2025",
    subject: "Hotel stay — La sabana apartment",
    currency: "USDC",
    issued: "25 January 2025",
    dueDate: "10 February 2025",
    notes: "Includes security deposit held in escrow until checkout.",
    billedTo: "John Smith",
    billingDetails: "La sabana apartment · Monthly rent + deposit",
    products: [
      {
        product: "Rent (January)",
        pricePerMonth: "$3,200",
        deposit: "$800",
      },
      {
        product: "Cleaning fee",
        pricePerMonth: "—",
        deposit: "$0",
      },
    ],
    subtotal: "$4,000",
    discount: "$0",
    total: "$4,000",
    terms:
      "Payment is processed via SafeTrust escrow. Deposit is released per rental agreement after property inspection.",
    tenant: {
      name: "John Smith",
      wallet: "MJE...XN32",
      email: "John_s@gmail.com",
      rentalDate: "20 January 2025",
      depositAmount: "$800",
    },
    owner: {
      name: "Alberto Casas",
      wallet: "MJE...XN32",
      email: "albertoCasas100@gmail.com",
    },
    beneficiary: {
      name: "Alberto Casas",
      wallet: "MJE...XN32",
      email: "albertoCasas100@gmail.com",
      releasedDate: "15 February 2025",
      depositAmount: "$800",
      phone: "+1 (555) 010-4200",
    },
    escrowJustification:
      "Tenant completed checkout. No damages reported. Deposit approved for release to property owner.",
    claimsPlaceholder: "Describe any claims or notes for this release…",
    apartment: { name: "La sabana apartment", image: "/img/apt-1.jpg" },
  };
}
