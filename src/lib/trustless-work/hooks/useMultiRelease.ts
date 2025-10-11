'use client';

/**
 * useMultiRelease Hook
 *
 * Custom hook for managing multi-release escrow operations including
 * milestone-based fund releases, approvals, and dispute management.
 *
 * Multi-release escrows release funds individually for each approved milestone.
 *
 * @see https://docs.trustlesswork.com/trustless-work/react-library-hooks
 */

import {
  useApproveMilestone,
  useReleaseFunds,
  useStartDispute,
  useResolveDispute,
  useWithdrawRemainingFunds,
  useChangeMilestoneStatus,
} from '@trustless-work/escrow/hooks';

import type {
  ApproveMilestonePayload,
  MultiReleaseReleaseFundsPayload,
  MultiReleaseStartDisputePayload,
  MultiReleaseResolveDisputePayload,
  WithdrawRemainingFundsPayload,
  ChangeMilestoneStatusPayload,
  MultiReleaseMilestone,
} from '@trustless-work/escrow/types';

const ESCROW_TYPE = 'multi-release' as const;

/**
 * Custom hook for managing multi-release escrow operations
 *
 * Provides specialized functions for multi-release escrows including:
 * - Approving individual milestones
 * - Changing milestone status
 * - Releasing funds per milestone
 * - Starting disputes for specific milestones
 * - Resolving milestone disputes
 * - Withdrawing remaining funds
 *
 * @example
 * ```tsx
 * import { useMultiRelease } from '@/lib/trustless-work/hooks/useMultiRelease';
 *
 * function MultiReleaseEscrowComponent() {
 *   const {
 *     approveMilestone,
 *     releaseFunds,
 *     startDispute,
 *     resolveDispute,
 *   } = useMultiRelease();
 *
 *   const handleRelease = async () => {
 *     const result = await releaseFunds({
 *       contractId: 'escrow-contract-id',
 *       milestoneIndex: '0',
 *       releaseSigner: 'release-signer-address',
 *     });
 *     console.log('Milestone funds released:', result);
 *   };
 *
 *   return <button onClick={handleRelease}>Release Milestone Funds</button>;
 * }
 * ```
 */
export function useMultiRelease() {
  const { approveMilestone: approveFromSDK } = useApproveMilestone();
  const { releaseFunds: releaseFromSDK } = useReleaseFunds();
  const { startDispute: startDisputeFromSDK } = useStartDispute();
  const { resolveDispute: resolveDisputeFromSDK } = useResolveDispute();
  const { withdrawRemainingFunds: withdrawFromSDK } = useWithdrawRemainingFunds();
  const { changeMilestoneStatus: changeStatusFromSDK } = useChangeMilestoneStatus();

  /**
   * Approve a milestone in a multi-release escrow
   *
   * Approves a specific milestone, making it ready for fund release.
   *
   * @param payload - Approve milestone payload containing contractId, milestoneIndex, and approver
   * @returns Promise with the escrow request response
   */
  const approveMilestone = async (payload: ApproveMilestonePayload) => {
    return approveFromSDK(payload, ESCROW_TYPE);
  };

  /**
   * Change the status of a milestone
   *
   * Allows the service provider to update milestone status with evidence.
   *
   * @param payload - Change milestone status payload
   * @returns Promise with the escrow request response
   */
  const changeMilestoneStatus = async (payload: ChangeMilestoneStatusPayload) => {
    return changeStatusFromSDK(payload, ESCROW_TYPE);
  };

  /**
   * Release funds for a specific milestone
   *
   * Releases funds associated with an approved milestone to the receiver.
   * Each milestone can be released independently.
   *
   * @param payload - Release funds payload containing contractId, milestoneIndex, and releaseSigner
   * @returns Promise with the escrow request response
   */
  const releaseFunds = async (payload: MultiReleaseReleaseFundsPayload) => {
    return releaseFromSDK(payload, ESCROW_TYPE);
  };

  /**
   * Start a dispute for a specific milestone
   *
   * Initiates the dispute process for a particular milestone.
   * Only affects the disputed milestone, not the entire escrow.
   *
   * @param payload - Start dispute payload containing contractId, milestoneIndex, and signer
   * @returns Promise with the escrow request response
   */
  const startDispute = async (payload: MultiReleaseStartDisputePayload) => {
    return startDisputeFromSDK(payload, ESCROW_TYPE);
  };

  /**
   * Resolve a dispute for a specific milestone
   *
   * Resolves an ongoing dispute by distributing milestone funds according to the dispute resolver's decision.
   *
   * @param payload - Resolve dispute payload containing contractId, milestoneIndex, disputeResolver, and distributions
   * @returns Promise with the escrow request response
   */
  const resolveDispute = async (payload: MultiReleaseResolveDisputePayload) => {
    return resolveDisputeFromSDK(payload, ESCROW_TYPE);
  };

  /**
   * Withdraw remaining funds after dispute resolution
   *
   * Allows withdrawal of any remaining funds after a dispute has been resolved.
   *
   * @param payload - Withdraw remaining funds payload
   * @returns Promise with the escrow request response
   */
  const withdrawRemainingFunds = async (payload: WithdrawRemainingFundsPayload) => {
    return withdrawFromSDK(payload);
  };

  return {
    // Milestone operations
    approveMilestone,
    changeMilestoneStatus,

    // Release operations
    releaseFunds,

    // Dispute operations
    startDispute,
    resolveDispute,
    withdrawRemainingFunds,
  };
}

/**
 * Helper function to calculate total escrow amount from milestones
 *
 * @param milestones - Array of multi-release milestones
 * @returns Total amount from all milestones
 */
export function calculateTotalAmount(milestones: MultiReleaseMilestone[]): number {
  return milestones.reduce((total, milestone) => total + milestone.amount, 0);
}

/**
 * Helper function to calculate released amount
 *
 * @param milestones - Array of multi-release milestones
 * @returns Total amount released from approved milestones
 */
export function calculateReleasedAmount(milestones: MultiReleaseMilestone[]): number {
  return milestones
    .filter((milestone) => milestone.flags?.released === true)
    .reduce((total, milestone) => total + milestone.amount, 0);
}

/**
 * Helper function to calculate pending amount
 *
 * @param milestones - Array of multi-release milestones
 * @returns Total amount pending release
 */
export function calculatePendingAmount(milestones: MultiReleaseMilestone[]): number {
  return milestones
    .filter((milestone) => milestone.flags?.released !== true)
    .reduce((total, milestone) => total + milestone.amount, 0);
}

/**
 * Helper function to get milestone release progress
 *
 * @param milestones - Array of multi-release milestones
 * @returns Object with total, released, pending amounts and percentage
 */
export function getMilestoneReleaseProgress(milestones: MultiReleaseMilestone[]): {
  total: number;
  released: number;
  pending: number;
  percentage: number;
} {
  const total = calculateTotalAmount(milestones);
  const released = calculateReleasedAmount(milestones);
  const pending = calculatePendingAmount(milestones);
  const percentage = total > 0 ? (released / total) * 100 : 0;

  return { total, released, pending, percentage };
}

/**
 * Helper function to check if a milestone is ready for release
 *
 * @param milestone - Multi-release milestone to check
 * @returns True if milestone is approved and not yet released
 */
export function isMilestoneReadyForRelease(milestone: MultiReleaseMilestone): boolean {
  return (
    milestone.flags?.approved === true &&
    milestone.flags?.released !== true &&
    milestone.flags?.disputed !== true
  );
}

/**
 * Helper function to get milestones by status
 *
 * @param milestones - Array of multi-release milestones
 * @param status - Status to filter by (approved, released, disputed, pending)
 * @returns Filtered array of milestones
 */
export function getMilestonesByStatus(
  milestones: MultiReleaseMilestone[],
  status: 'approved' | 'released' | 'disputed' | 'pending'
): MultiReleaseMilestone[] {
  switch (status) {
    case 'approved':
      return milestones.filter((m) => m.flags?.approved === true && m.flags?.released !== true);
    case 'released':
      return milestones.filter((m) => m.flags?.released === true);
    case 'disputed':
      return milestones.filter((m) => m.flags?.disputed === true);
    case 'pending':
      return milestones.filter((m) => m.flags?.approved !== true && m.flags?.released !== true);
    default:
      return milestones;
  }
}
