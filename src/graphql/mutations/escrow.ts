import { gql } from '@apollo/client';

export const CREATE_ESCROW_TRANSACTION = gql`
  mutation CreateEscrowTransaction($input: escrow_transactions_insert_input!) {
    insert_escrow_transactions_one(object: $input) {
      id
      amount
      status
      created_at
      escrow_transaction_users {
        id
        role
        funding_status
        wallet_address
      }
    }
  }
`;

export const UPDATE_FUNDING_STATUS = gql`
  mutation UpdateFundingStatus($escrowUserId: uuid!, $fundingStatus: String!, $transactionHash: String!) {
    update_escrow_transaction_users_by_pk(
      pk_columns: { id: $escrowUserId },
      _set: { 
        funding_status: $fundingStatus, 
        transaction_hash: $transactionHash,
        funded_at: "now()" 
      }
    ) {
      id
      funding_status
      transaction_hash
      funded_at
      escrow_transaction {
        id
        status
      }
    }
  }
`;

export const GET_ESCROW_TRANSACTIONS = gql`
  query GetEscrowTransactions($where: escrow_transactions_bool_exp, $order_by: [escrow_transactions_order_by!], $limit: Int, $offset: Int) {
    escrow_transactions(where: $where, order_by: $order_by, limit: $limit, offset: $offset) {
      id
      amount
      status
      created_at
      escrow_transaction_users {
        id
        role
        funding_status
        wallet_address
      }
    }
  }
`;
