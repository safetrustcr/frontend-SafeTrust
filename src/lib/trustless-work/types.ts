/**
 * TrustlessWork SDK Type Definitions
 *
 * This file contains TypeScript interfaces and types for the TrustlessWork escrow system.
 * These types are based on the @trustless-work/escrow package v2.0.8
 *
 * @see https://docs.trustlesswork.com/trustless-work/developer-resources/types
 */

// Re-export types that ARE actually exported by the SDK
export type {
  // Core Escrow Types
  SingleReleaseEscrow,
  MultiReleaseEscrow,

  // Milestone Types
  SingleReleaseMilestone,
  MultiReleaseMilestone,

  // Supporting Types
  Roles,
  Role,
  Flags,
  Trustline,
  EscrowType,
  Status,

  // Response Types
  EscrowRequestResponse,
  SendTransactionResponse,
  InitializeSingleReleaseEscrowResponse,
  InitializeMultiReleaseEscrowResponse,
  UpdateSingleReleaseEscrowResponse,
  UpdateMultiReleaseEscrowResponse,
  GetEscrowBalancesResponse,
  GetEscrowsFromIndexerResponse,

  // Payload Types
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
  GetEscrowsFromIndexerBySignerParams,
  GetEscrowsFromIndexerByRoleParams,
  GetEscrowFromIndexerByContractIdsParams,
} from '@trustless-work/escrow/types';

// Import types for local use
import type { SingleReleaseEscrow, MultiReleaseEscrow, SingleReleaseMilestone, MultiReleaseMilestone, EscrowType } from '@trustless-work/escrow/types';

/**
 * Unified Escrow Data type
 * Represents either a single-release or multi-release escrow
 */
export type EscrowData = SingleReleaseEscrow | MultiReleaseEscrow;

/**
 * Unified Milestone type
 * Represents either a single-release or multi-release milestone
 */
export type Milestone = SingleReleaseMilestone | MultiReleaseMilestone;

/**
 * Configuration options for the TrustlessWork Provider
 */
export interface TrustlessWorkConfigOptions {
  /**
   * The base URL for the TrustlessWork API
   * Use 'https://api.trustlesswork.com' for production
   * Use 'https://dev.api.trustlesswork.com' for development
   */
  baseURL: string;

  /**
   * The API key for authenticating with the TrustlessWork API
   */
  apiKey: string;

  /**
   * The network to use (testnet or mainnet)
   */
  network?: 'testnet' | 'mainnet';
}

/**
 * Environment variable configuration
 */
export interface TrustlessWorkEnvConfig {
  NEXT_PUBLIC_API_KEY: string;
  NEXT_PUBLIC_TRUSTLESS_API_URL: string;
  NEXT_PUBLIC_TRUSTLESS_API_URL_DEV: string;
  NEXT_PUBLIC_TRUSTLESS_NETWORK: 'testnet' | 'mainnet';
}

/**
 * ADDITIONAL TYPES (not exported by SDK but needed)
 * These types exist in the SDK but are not exposed in the public API
 */

/**
 * Single Release Escrow Status
 * These are the possible statuses for a single-release escrow
 */
export type SingleReleaseEscrowStatus = 'working' | 'pendingRelease' | 'released' | 'resolved' | 'inDispute';

/**
 * Base Milestone Payload
 * Used for creating milestones in both single and multi-release escrows
 */
export interface BaseMilestonePayload {
  /**
   * Text describing the function of the milestone
   */
  description: string;
}

/**
 * Single Release Milestone Payload
 * For single-release escrow milestones (only requires description)
 */
export type SingleReleaseMilestonePayload = BaseMilestonePayload;

/**
 * Multi Release Milestone Payload
 * For multi-release escrow milestones (includes amount)
 */
export interface MultiReleaseMilestonePayload extends BaseMilestonePayload {
  /**
   * Amount to be transferred upon completion of this milestone
   */
  amount: number;
}

/**
 * Get Escrows From Indexer Params
 * Base parameters for querying escrows from the indexer
 */
export interface GetEscrowsFromIndexerParams {
  /**
   * Page number for pagination
   */
  page?: number;
  /**
   * Sort direction
   */
  orderDirection?: 'asc' | 'desc';
  /**
   * Field to order by
   */
  orderBy?: 'createdAt' | 'updatedAt' | 'amount';
  /**
   * Filter by start date
   */
  startDate?: string;
  /**
   * Filter by end date
   */
  endDate?: string;
  /**
   * Maximum amount filter
   */
  maxAmount?: number;
  /**
   * Minimum amount filter
   */
  minAmount?: number;
  /**
   * Filter by active status
   */
  isActive?: boolean;
  /**
   * Filter by title
   */
  title?: string;
  /**
   * Filter by engagement ID
   */
  engagementId?: string;
  /**
   * Filter by escrow status
   */
  status?: SingleReleaseEscrowStatus;
  /**
   * Filter by escrow type
   */
  type?: EscrowType;
  /**
   * Validate on blockchain (slower)
   */
  validateOnChain?: boolean;
}

/**
 * Update From Transaction Hash Payload
 * Payload for updating escrow from a transaction hash
 */
export interface UpdateFromTxHashPayload {
  /**
   * Transaction hash to be used for the update
   */
  txHash: string;
}

/**
 * Update From Transaction Hash Response
 * Response from updating escrow from a transaction hash
 */
export interface UpdateFromTxHashResponse {
  /**
   * Status of the request
   */
  status: 'SUCCESS' | 'FAILED';
  /**
   * Message describing the result
   */
  message: string;
}
