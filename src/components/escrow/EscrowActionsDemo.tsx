"use client";

import React from 'react';
import { useOptimisticMutation } from '@/hooks/useOptimisticMutation';
import { CREATE_ESCROW_TRANSACTION, UPDATE_FUNDING_STATUS } from '@/graphql/mutations/escrow';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

export const EscrowActionsDemo: React.FC = () => {
    const [createEscrow] = useOptimisticMutation(
        CREATE_ESCROW_TRANSACTION,
        'createEscrowTransaction'
    );

    const [updateFunding] = useOptimisticMutation(
        UPDATE_FUNDING_STATUS,
        'updateFundingStatus'
    );

    const handleCreateDemoEscrow = async () => {
        try {
            await createEscrow({
                variables: {
                    input: {
                        amount: 500,
                        status: 'pending',
                        escrow_transaction_users: {
                            data: [
                                { role: 'contractor', wallet_address: 'G...123' },
                                { role: 'client', wallet_address: 'G...456' }
                            ]
                        }
                    }
                }
            });
            toast.success('Escrow creation initiated (Optimistic)');
        } catch (err) {
            toast.error('Failed to create escrow');
        }
    };

    const handleUpdateFundingDemo = async (userId: string) => {
        try {
            await updateFunding({
                variables: {
                    escrowUserId: userId,
                    fundingStatus: 'funded',
                    transactionHash: 'hash_123456'
                }
            });
            toast.success('Funding status updated (Optimistic)');
        } catch (err) {
            toast.error('Failed to update funding');
        }
    };

    return (
        <div className="p-4 border rounded-xl bg-card space-y-4">
            <h3 className="text-lg font-bold">Optimistic Actions Demo</h3>
            <div className="flex gap-2">
                <Button onClick={handleCreateDemoEscrow}>
                    Demo: Create Escrow
                </Button>
            </div>
            <p className="text-xs text-muted-foreground italic">
                These actions use the custom useOptimisticMutation hook to provide instant UI updates.
            </p>
        </div>
    );
};
