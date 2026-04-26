'use client';

/**
 * useEscrowStatus Hook
 *
 * Custom hook for fetching and managing escrow status data.
 * Provides functionality for real-time status monitoring and polling.
 *
 * @see https://docs.trustlesswork.com/trustless-work/developer-resources
 */

import { useQuery } from '@tanstack/react-query';
import { useGetEscrowFromIndexerByContractIds } from '@trustless-work/escrow';
import type { GetEscrowsFromIndexerResponse } from '@trustless-work/escrow/types';

interface UseEscrowStatusParams {
  contractId: string;
  signer: string;
  enabled?: boolean;
  refetchInterval?: number; // in milliseconds
  validateOnChain?: boolean;
}

/**
 * Hook to fetch and monitor escrow status
 *
 * @param params - Parameters for fetching escrow status
 * @returns Query result with escrow status data
 *
 * @example
 * ```tsx
 * const { data: escrow, isLoading, error } = useEscrowStatus({
 *   contractId: 'CONTRACT_ID',
 *   signer: 'WALLET_ADDRESS',
 *   refetchInterval: 30000 // Poll every 30 seconds
 * });
 * ```
 */
export function useEscrowStatus({
  contractId,
  signer,
  enabled = true,
  refetchInterval = 30000, // Default: 30 seconds
  validateOnChain = true,
}: UseEscrowStatusParams) {
  const { getEscrowByContractIds } = useGetEscrowFromIndexerByContractIds();

  return useQuery({
    queryKey: ['escrow-status', contractId, signer, validateOnChain],
    queryFn: async (): Promise<GetEscrowsFromIndexerResponse | null> => {
      if (!contractId || !signer) {
        return null;
      }

      try {
        const escrows = await getEscrowByContractIds({
          contractIds: [contractId],
          signer,
          validateOnChain,
        });

        // Return the first escrow (since we're querying by a single contractId)
        return Array.isArray(escrows) && escrows.length > 0 ? escrows[0] : null;
      } catch (error) {
        console.error('Error fetching escrow status:', error);
        throw error;
      }
    },
    enabled: enabled && !!contractId && !!signer,
    refetchInterval, // Auto-refetch at specified interval
    staleTime: 1000 * 60, // Consider data stale after 1 minute
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Extract status string from escrow data
 *
 * @param escrow - Escrow data object
 * @returns Status string
 */
export function getEscrowStatusString(
  escrow: GetEscrowsFromIndexerResponse | null
): string {
  if (!escrow) return 'unknown';

  // Handle single-release escrow status
  if ('status' in escrow && escrow.status) {
    return escrow.status;
  }

  // Handle multi-release escrow - determine status based on milestones
  if ('milestones' in escrow && Array.isArray(escrow.milestones)) {
    const milestones = escrow.milestones;

    if (milestones.length === 0) return 'pending';

    const allReleased = milestones.every(
      (m: any) => m.flags?.released || m.status === 'released'
    );
    if (allReleased) return 'released';

    const hasDisputed = milestones.some(
      (m: any) => m.flags?.disputed || m.status === 'disputed'
    );
    if (hasDisputed) return 'inDispute';

    const hasApproved = milestones.some(
      (m: any) => m.approved || m.status === 'approved'
    );
    if (hasApproved) return 'pendingRelease';

    return 'working';
  }

  return 'unknown';
}

/**
 * Get variant for status badge based on status
 *
 * @param status - Escrow status string
 * @returns Badge variant
 */
export function getStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const statusLower = status.toLowerCase();

  switch (statusLower) {
    case 'released':
    case 'completed':
      return 'default'; // Green/success

    case 'pendinrelease':
    case 'pending':
    case 'working':
    case 'funded':
      return 'secondary'; // Blue/info

    case 'indispute':
    case 'disputed':
    case 'cancelled':
    case 'failed':
      return 'destructive'; // Red/danger

    default:
      return 'outline'; // Gray/neutral
  }
}

/**
 * Format status for display
 *
 * @param status - Raw status string
 * @returns Formatted status string
 */
export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    working: 'In Progress',
    pendingRelease: 'Pending Release',
    released: 'Released',
    inDispute: 'In Dispute',
    resolved: 'Resolved',
    pending: 'Pending',
    funded: 'Funded',
    completed: 'Completed',
    cancelled: 'Cancelled',
    unknown: 'Unknown',
  };

  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
}
