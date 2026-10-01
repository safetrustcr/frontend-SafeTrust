/**
 * Snapshot structure representing the state of an escrow transaction in the mock data layer.
 * Mirrors the structure expected by components consuming escrow status updates.
 */
export type EscrowStatusSnapshot = {
  id: string;
  status: string;
  updated_at: string;
  transaction_hash: string | null;
  escrow_transaction_users: Array<{
    id: string;
    funding_status: string;
    funded_at: string | null;
    transaction_hash: string | null;
  }>;
};

/**
 * Generates a mock escrow status snapshot for a given escrow identifier.
 *
 * @param escrowId - Unique identifier of the escrow transaction.
 * @returns An EscrowStatusSnapshot object pre-seeded with default mock status values.
 */
export function getMockEscrowStatus(escrowId: string): EscrowStatusSnapshot {
  return {
    id: escrowId,
    status: "funded",
    updated_at: new Date().toISOString(),
    transaction_hash: null,
    escrow_transaction_users: [],
  };
}
