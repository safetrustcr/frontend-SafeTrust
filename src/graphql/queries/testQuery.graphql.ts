import { gql } from '@apollo/client';

export const GET_ESCROW_TRANSACTIONS = gql`
  query GetEscrowTransactions {
    escrow_transactions(limit: 10) {
      id
      contract_id
      created_at
      escrow_transaction_users {
        id
        funding_status
      }
    }
  }
`;
