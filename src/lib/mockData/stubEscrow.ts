import type { StubEscrowDetail } from "@/types/escrow";

export const DEMO_SOROBAN_CONTRACT_ID =
  "CA3D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCCZ";

const SOROBAN_CONTRACT_ID = /^C[A-Z2-7]{55}$/;

/**
 * Resolves the on-chain Soroban contract ID for a given escrow record ID.
 * - If the escrow ID is already a valid Soroban contract ID, preserves it.
 * - For demo records (e.g. demo-escrow-0001, escrow_1), returns a valid Soroban contract ID
 *   so that "View Contract" and detail views display complete on-chain metadata.
 * - For reservation or non-contract IDs (e.g. res-1, INV...), returns undefined
 *   to display the "contract not available yet" state.
 */
function resolveContractId(escrowId: string): string | undefined {
  if (SOROBAN_CONTRACT_ID.test(escrowId)) {
    return escrowId;
  }
  if (escrowId.startsWith("demo") || escrowId.startsWith("escrow_")) {
    return DEMO_SOROBAN_CONTRACT_ID;
  }
  return undefined;
}

// TODO: replace with useQuery(GET_ESCROW_BY_ID) in GraphQL wiring issue
export function getStubEscrow(escrowId: string): StubEscrowDetail {
  return {
    id: escrowId,
    contractId: resolveContractId(escrowId),
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
    apartment: { name: "La sabana apartment", image: "/img/room1.png" },
  };
}
