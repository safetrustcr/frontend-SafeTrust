import { gql } from '@apollo/client';

export const optimisticUpdatePolicies = {
    // Optimistic escrow creation
    createEscrowTransaction: {
        update: (cache: any, { data }: any) => {
            const newEscrow = data.insert_escrow_transactions_one;
            if (!newEscrow) return;

            // Update the escrow list cache
            cache.modify({
                fields: {
                    escrow_transactions(existingEscrows = []) {
                        const newEscrowRef = cache.writeFragment({
                            data: newEscrow,
                            fragment: gql`
                fragment NewEscrow on escrow_transactions {
                  id
                  amount
                  status
                  created_at
                }
              `,
                        });
                        return [newEscrowRef, ...existingEscrows];
                    }
                }
            });
        },
        optimisticResponse: (variables: any) => ({
            insert_escrow_transactions_one: {
                __typename: 'escrow_transactions',
                id: `temp-${Date.now()}`,
                amount: variables.input.amount,
                status: 'pending',
                created_at: new Date().toISOString(),
                escrow_transaction_users: variables.input.escrow_transaction_users.data.map((user: any, index: number) => ({
                    __typename: 'escrow_transaction_users',
                    id: `temp-user-${Date.now()}-${index}`,
                    role: user.role,
                    funding_status: 'pending',
                    wallet_address: user.wallet_address,
                }))
            }
        }),
    },

    // Optimistic funding status update
    updateFundingStatus: {
        optimisticResponse: (variables: any) => ({
            update_escrow_transaction_users_by_pk: {
                __typename: 'escrow_transaction_users',
                id: variables.escrowUserId,
                funding_status: variables.fundingStatus,
                transaction_hash: variables.transactionHash,
                funded_at: new Date().toISOString(),
                escrow_transaction: {
                    __typename: 'escrow_transactions',
                    id: `escrow-${variables.escrowUserId}`,
                    status: 'funding_in_progress'
                }
            }
        })
    }
};
