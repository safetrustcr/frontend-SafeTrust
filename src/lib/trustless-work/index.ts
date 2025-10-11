/**
 * TrustlessWork SDK Integration
 *
 * Main entry point for the TrustlessWork SDK integration.
 * This module provides all necessary components, hooks, types, and utilities
 * for working with the TrustlessWork escrow system.
 *
 * @see https://docs.trustlesswork.com/trustless-work
 * @module trustless-work
 *
 * @example
 * ```tsx
 * // Import provider
 * import { TrustlessWorkProvider } from '@/lib/trustless-work';
 *
 * // Import hooks (use separate import for hooks)
 * import { useEscrow, useSingleRelease, useMultiRelease } from '@/lib/trustless-work/hooks';
 *
 * // Import types
 * import type { EscrowData, Milestone } from '@/lib/trustless-work';
 *
 * // Import constants
 * import { TRUSTLESS_WORK_CONSTANTS } from '@/lib/trustless-work';
 * ```
 */

// Provider
export { TrustlessWorkProvider, withTrustlessWork } from './provider';

// Configuration
export {
  getTrustlessWorkConfig,
  validateTrustlessWorkConfig,
  TRUSTLESS_WORK_API_URLS,
  TRUSTLESS_WORK_CONSTANTS,
} from './config';

// Types
export type {
  // Custom types
  EscrowData,
  Milestone,
  TrustlessWorkConfigOptions,
  TrustlessWorkEnvConfig,

  // SDK types (re-exported)
  SingleReleaseEscrow,
  MultiReleaseEscrow,
  SingleReleaseMilestone,
  MultiReleaseMilestone,
  Roles,
  Role,
  Flags,
  Trustline,
  EscrowType,
  Status,
  SingleReleaseEscrowStatus,
  EscrowRequestResponse,
  SendTransactionResponse,
  InitializeSingleReleaseEscrowResponse,
  InitializeMultiReleaseEscrowResponse,
  UpdateSingleReleaseEscrowResponse,
  UpdateMultiReleaseEscrowResponse,
  GetEscrowBalancesResponse,
  GetEscrowsFromIndexerResponse,
  UpdateFromTxHashResponse,
  SingleReleaseMilestonePayload,
  MultiReleaseMilestonePayload,
  InitializeSingleReleaseEscrowPayload,
  InitializeMultiReleaseEscrowPayload,
  UpdateSingleReleaseEscrowPayload,
  UpdateMultiReleaseEscrowPayload,
  FundEscrowPayload,
  ChangeMilestoneStatusPayload,
  ApproveMilestonePayload,
  SingleReleaseStartDisputePayload,
  MultiReleaseStartDisputePayload,
  SingleReleaseResolveDisputePayload,
  MultiReleaseResolveDisputePayload,
  WithdrawRemainingFundsPayload,
  SingleReleaseReleaseFundsPayload,
  MultiReleaseReleaseFundsPayload,
  GetBalanceParams,
  GetEscrowsFromIndexerParams,
  GetEscrowsFromIndexerBySignerParams,
  GetEscrowsFromIndexerByRoleParams,
  GetEscrowFromIndexerByContractIdsParams,
  UpdateFromTxHashPayload,
} from './types';

/**
 * HOOKS MUST BE IMPORTED FROM '@/lib/trustless-work/hooks'
 *
 * Due to Next.js SSR constraints, hooks cannot be re-exported from this file.
 * Import hooks directly from the hooks module:
 *
 * @example
 * ```tsx
 * import { useEscrow, useSingleRelease, useMultiRelease } from '@/lib/trustless-work/hooks';
 * ```
 */
