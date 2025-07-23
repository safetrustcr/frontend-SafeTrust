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
