import { gql } from "@apollo/client";

export const ESCROW_STATUS_SUBSCRIPTION = gql`
  subscription EscrowStatusUpdates($escrowId: String!) {
    escrow_transactions_by_pk(id: $escrowId) {
      id
      status
      updated_at
      transaction_hash
      escrow_transaction_users {
        id
        funding_status
        funded_at
        transaction_hash
      }
    }
  }
`;

export const USER_ESCROW_ACTIVITY_SUBSCRIPTION = gql`
  subscription UserEscrowActivity($userId: String!) {
    escrow_transaction_users(
      where: { user_id: { _eq: $userId } }
      order_by: { updated_at: desc }
    ) {
      id
      funding_status
      updated_at
      escrow_transaction {
        id
        status
        amount
        updated_at
      }
    }
  }
`;
