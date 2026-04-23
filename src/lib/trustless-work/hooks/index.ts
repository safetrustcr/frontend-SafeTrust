'use client';

/**
 * TrustlessWork Hooks
 *
 * This file exports all custom hooks for the TrustlessWork SDK integration.
 * Import hooks from this file for cleaner imports throughout the application.
 *
 * @example
 * ```tsx
 * import { useEscrow, useSingleRelease, useMultiRelease } from '@/lib/trustless-work/hooks';
 * ```
 */

// Main hooks
export { useEscrow, isSingleReleaseEscrow, isMultiReleaseEscrow } from './useEscrow';
export { useSingleRelease, areAllMilestonesApproved, getMilestoneProgress } from './useSingleRelease';
export {
  useMultiRelease,
  calculateTotalAmount,
  calculateReleasedAmount,
  calculatePendingAmount,
  getMilestoneReleaseProgress,
  isMilestoneReadyForRelease,
  getMilestonesByStatus,
} from './useMultiRelease';

// Re-export SDK hooks for advanced usage
export {
  useInitializeEscrow,
  useSendTransaction,
  useUpdateEscrow,
  useFundEscrow,
  useReleaseFunds,
  useChangeMilestoneStatus,
  useApproveMilestone,
  useStartDispute,
  useResolveDispute,
  useWithdrawRemainingFunds,
  useGetMultipleEscrowBalances,
  useGetEscrowFromIndexerByContractIds,
  useGetEscrowsFromIndexerBySigner,
  useGetEscrowsFromIndexerByRole,
  useUpdateFromTxHash,
} from '@trustless-work/escrow/hooks';
