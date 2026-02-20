export type GetEscrowTransactionsQuery = {
  escrow_transactions: Array<{
    id: string;
    contract_id: string;
    created_at: string;
    escrow_transaction_users: Array<{
      id: string;
      funding_status: string;
    }>;
  }>;
};

export type CreateTestUserMutation = {
  insert_users_one?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    created_at: string;
  };
};

export type CreateTestUserVariables = {
  email: string;
  firstName: string;
  lastName: string;
};

// --- Subscription Types ---

export type EscrowStatusSubscription = {
  escrow_transactions_by_pk: {
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
  } | null;
};

export type UserEscrowActivitySubscription = {
  escrow_transaction_users: Array<{
    id: string;
    funding_status: string;
    updated_at: string;
    escrow_transaction: {
      id: string;
      status: string;
      amount: number;
      updated_at: string;
    };
  }>;
};

export type PaymentStatusSubscription = {
  escrow_transaction_users_by_pk: {
    id: string;
    funding_status: string;
    funded_at: string | null;
    transaction_hash: string | null;
    escrow_transaction: {
      id: string;
      status: string;
      amount: number;
    };
  } | null;
};

export type BlockchainTransactionUpdatesSubscription = {
  blockchain_transactions: Array<{
    transaction_hash: string;
    status: string;
    confirmations: number;
    block_height: number | null;
    updated_at: string;
  }>;
};

export type UserNotificationsSubscription = {
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
  }>;
};
