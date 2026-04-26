import { graphql } from '@/graphql/generated';

export const GET_ESCROW_TRANSACTIONS = graphql(`
  query GetEscrowTransactions($limit: Int = 10) {
    escrow_transactions(limit: $limit, order_by: { created_at: desc }) {
      id
      contract_id
      created_at
      fund_payload
      escrow_transaction_users {
        id
        user_id  
        funding_status
        funded_at
      }
    }
  }
`);

export const FUND_ESCROW_TRANSACTION = graphql(`
  mutation FundEscrowTransaction(
    $escrow_transaction_id: UUID!
    $user_id: UUID!
    $amount: String!
  ) {
    fund_escrow_transaction(
      escrow_transaction_id: $escrow_transaction_id
      user_id: $user_id
      amount: $amount
    ) {
      success
      payload
    }
  }
`);
