import { useMutation, MutationHookOptions, DocumentNode } from '@apollo/client';
import { optimisticUpdatePolicies } from '@/utils/optimistic-updates';

export function useOptimisticMutation(
    mutation: DocumentNode,
    policyName: keyof typeof optimisticUpdatePolicies,
    options?: MutationHookOptions
) {
    const policy = optimisticUpdatePolicies[policyName];

    return useMutation(mutation, {
        ...options,
        optimisticResponse: policy.optimisticResponse,
        update: (cache, result) => {
            if (policy.update) {
                policy.update(cache, result);
            }
            if (options?.update) {
                options.update(cache, result);
            }
        },
    });
}
