'use client';

import { useQuery } from '@apollo/client/react';
import { GET_ESCROW_TRANSACTIONS } from '@/graphql/queries/escrow-queries';

interface EscrowTransactionUser {
  id: string;
  funding_status: string;
}

interface EscrowTransaction {
  id: string;
  contract_id: string;
  created_at: string;
  escrow_transaction_users: EscrowTransactionUser[];
}

interface EscrowQueryData {
  escrow_transactions: EscrowTransaction[];
}

export function EscrowList() {
  const { data, loading, error } = useQuery<EscrowQueryData>(GET_ESCROW_TRANSACTIONS, {
    variables: { limit: 20 }
  });

  if (loading) return <div>Loading escrows...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.escrow_transactions.map((escrow) => (
        <div key={escrow.id}>
          <h3>Contract: {escrow.contract_id}</h3>
          <p>Created: {new Date(escrow.created_at).toLocaleDateString()}</p>
          <p>Users: {escrow.escrow_transaction_users.length}</p>
          {escrow.escrow_transaction_users.map((user) => (
            <span key={user.id} className={`status-${user.funding_status}`}>
              {user.funding_status}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
