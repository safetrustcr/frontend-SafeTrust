import { gql } from "@apollo/client";

export const PAYMENT_STATUS_SUBSCRIPTION = gql`
  subscription PaymentStatusUpdates($escrowUserId: uuid!) {
    escrow_transaction_users_by_pk(id: $escrowUserId) {
      id
      funding_status
      updated_at
      transaction_hash
    }
  }
`;

export const BLOCKCHAIN_TRANSACTION_SUBSCRIPTION = gql`
  subscription BlockchainTransactionUpdates($transactionHash: String!) {
    blockchain_transactions(
      where: { transaction_hash: { _eq: $transactionHash } }
    ) {
      transaction_hash
      status
      confirmations
      block_height
      updated_at
    }
  }
`;
