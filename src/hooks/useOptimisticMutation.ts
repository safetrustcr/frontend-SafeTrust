import { MutationHookOptions, DocumentNode } from '@apollo/client';
import { optimisticUpdatePolicies } from '@/utils/optimistic-updates';

export function useOptimisticMutation(
    _mutation: DocumentNode,
    _policyName: keyof typeof optimisticUpdatePolicies,
    _options?: MutationHookOptions
) {
    // TODO: wire in Batch N — restore useMutation once Apollo v4 + React 19 compatibility is confirmed
    return [() => Promise.resolve(), { loading: false, error: undefined, data: undefined }] as const;
}