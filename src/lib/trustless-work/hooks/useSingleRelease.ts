'use client';

/**
 * useSingleRelease Hook
 *
 * Custom hook for managing single-release escrow operations including
 * milestone approvals, releasing funds, and dispute management.
 *
 * Single-release escrows release all funds at once when all milestones are approved.
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
  SingleReleaseReleaseFundsPayload,
  SingleReleaseStartDisputePayload,
  SingleReleaseResolveDisputePayload,
  WithdrawRemainingFundsPayload,
  ChangeMilestoneStatusPayload,
} from '@trustless-work/escrow/types';

const ESCROW_TYPE = 'single-release' as const;

/**
 * Custom hook for managing single-release escrow operations
 *
 * Provides specialized functions for single-release escrows including:
 * - Approving milestones
 * - Changing milestone status
 * - Releasing all funds at once
 * - Starting disputes
 * - Resolving disputes
 * - Withdrawing remaining funds
 *
 * @example
 * ```tsx
 * import { useSingleRelease } from '@/lib/trustless-work/hooks/useSingleRelease';
 *
 * function SingleReleaseEscrowComponent() {
 *   const {
 *     approveMilestone,
 *     releaseFunds,
 *     startDispute,
 *     resolveDispute,
 *   } = useSingleRelease();
 *
 *   const handleApprove = async () => {
 *     const result = await approveMilestone({
 *       contractId: 'escrow-contract-id',
 *       milestoneIndex: '0',
 *       approver: 'approver-address',
 *     });
 *     console.log('Milestone approved:', result);
 *   };
 *
 *   return <button onClick={handleApprove}>Approve Milestone</button>;
 * }
 * ```
 */
export function useSingleRelease() {
  const { approveMilestone: approveFromSDK } = useApproveMilestone();
  const { releaseFunds: releaseFromSDK } = useReleaseFunds();
  const { startDispute: startDisputeFromSDK } = useStartDispute();
  const { resolveDispute: resolveDisputeFromSDK } = useResolveDispute();
  const { withdrawRemainingFunds: withdrawFromSDK } = useWithdrawRemainingFunds();
  const { changeMilestoneStatus: changeStatusFromSDK } = useChangeMilestoneStatus();

  /**
   * Approve a milestone in a single-release escrow
   *
   * When all milestones are approved, the escrow becomes ready for release.
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
   * Release all funds from a single-release escrow
   *
   * Releases all escrow funds to the receiver at once.
   * Can only be called when all milestones are approved.
   *
   * @param payload - Release funds payload containing contractId and releaseSigner
   * @returns Promise with the escrow request response
   */
  const releaseFunds = async (payload: SingleReleaseReleaseFundsPayload) => {
    return releaseFromSDK(payload, ESCROW_TYPE);
  };

  /**
   * Start a dispute for a single-release escrow
   *
   * Initiates the dispute process, which pauses the escrow until resolved.
   *
   * @param payload - Start dispute payload containing contractId and signer
   * @returns Promise with the escrow request response
   */
  const startDispute = async (payload: SingleReleaseStartDisputePayload) => {
    return startDisputeFromSDK(payload, ESCROW_TYPE);
  };

  /**
   * Resolve a dispute for a single-release escrow
   *
   * Resolves an ongoing dispute by distributing funds according to the dispute resolver's decision.
   *
   * @param payload - Resolve dispute payload containing contractId, disputeResolver, and distributions
   * @returns Promise with the escrow request response
   */
  const resolveDispute = async (payload: SingleReleaseResolveDisputePayload) => {
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
 * Helper function to check if all milestones are approved
 *
 * @param milestones - Array of single-release milestones
 * @returns True if all milestones are approved
 */
export function areAllMilestonesApproved(
  milestones: Array<{ approved?: boolean }>
): boolean {
  return milestones.every((milestone) => milestone.approved === true);
}

/**
 * Helper function to get milestone approval progress
 *
 * @param milestones - Array of single-release milestones
 * @returns Object with total, approved, and percentage
 */
export function getMilestoneProgress(
  milestones: Array<{ approved?: boolean }>
): {
  total: number;
  approved: number;
  percentage: number;
} {
  const total = milestones.length;
  const approved = milestones.filter((m) => m.approved === true).length;
  const percentage = total > 0 ? (approved / total) * 100 : 0;

  return { total, approved, percentage };
}
