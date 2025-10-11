'use client';

/**
 * useEscrow Hook
 *
 * Custom hook for managing escrow operations including initialization,
 * funding, updating, and retrieving escrow data.
 *
 * @see https://docs.trustlesswork.com/trustless-work/react-library-hooks
 */

import {
  useInitializeEscrow,
  useFundEscrow,
  useUpdateEscrow,
  useSendTransaction,
  useGetEscrowFromIndexerByContractIds,
  useGetEscrowsFromIndexerBySigner,
  useGetEscrowsFromIndexerByRole,
  useGetMultipleEscrowBalances,
  useUpdateFromTxHash,
} from '@trustless-work/escrow/hooks';

import type {
  EscrowType,
  InitializeSingleReleaseEscrowPayload,
  InitializeMultiReleaseEscrowPayload,
  UpdateSingleReleaseEscrowPayload,
  UpdateMultiReleaseEscrowPayload,
  FundEscrowPayload,
  GetEscrowFromIndexerByContractIdsParams,
  GetEscrowsFromIndexerBySignerParams,
  GetEscrowsFromIndexerByRoleParams,
  GetBalanceParams,
} from '@trustless-work/escrow/types';

// Import our local type definitions
import type { UpdateFromTxHashPayload } from '../types';

/**
 * Custom hook for managing escrow operations
 *
 * Provides a unified interface for all escrow-related operations including:
 * - Initializing new escrows (single or multi-release)
 * - Funding escrows
 * - Updating escrow details
 * - Retrieving escrow data
 * - Getting escrow balances
 * - Sending transactions
 *
 * @example
 * ```tsx
 * import { useEscrow } from '@/lib/trustless-work/hooks/useEscrow';
 *
 * function MyComponent() {
 *   const {
 *     initialize,
 *     fund,
 *     update,
 *     getByContractIds,
 *     getBySigner,
 *     getByRole,
 *     getBalances,
 *     sendTransaction,
 *   } = useEscrow();
 *
 *   const handleInitialize = async () => {
 *     const result = await initialize(payload, 'single-release');
 *     console.log('Escrow initialized:', result);
 *   };
 *
 *   return <button onClick={handleInitialize}>Initialize Escrow</button>;
 * }
 * ```
 */
export function useEscrow() {
  const { deployEscrow } = useInitializeEscrow();
  const { fundEscrow } = useFundEscrow();
  const { updateEscrow } = useUpdateEscrow();
  const { sendTransaction } = useSendTransaction();
  const { getEscrowByContractIds } = useGetEscrowFromIndexerByContractIds();
  const { getEscrowsBySigner } = useGetEscrowsFromIndexerBySigner();
  const { getEscrowsByRole } = useGetEscrowsFromIndexerByRole();
  const { getMultipleBalances } = useGetMultipleEscrowBalances();
  const { updateFromTxHash } = useUpdateFromTxHash();

  /**
   * Initialize a new escrow (single or multi-release)
   *
   * @param payload - Escrow initialization payload
   * @param type - Escrow type ('single-release' or 'multi-release')
   * @returns Promise with the escrow request response
   */
  const initialize = async (
    payload: InitializeSingleReleaseEscrowPayload | InitializeMultiReleaseEscrowPayload,
    type: EscrowType
  ) => {
    return deployEscrow(payload, type);
  };

  /**
   * Fund an existing escrow
   *
   * @param payload - Fund escrow payload
   * @param type - Escrow type ('single-release' or 'multi-release')
   * @returns Promise with the escrow request response
   */
  const fund = async (payload: FundEscrowPayload, type: EscrowType) => {
    return fundEscrow(payload, type);
  };

  /**
   * Update an existing escrow
   *
   * @param payload - Update escrow payload
   * @param type - Escrow type ('single-release' or 'multi-release')
   * @returns Promise with the escrow request response
   */
  const update = async (
    payload: UpdateSingleReleaseEscrowPayload | UpdateMultiReleaseEscrowPayload,
    type: EscrowType
  ) => {
    return updateEscrow(payload, type);
  };

  /**
   * Get escrows by contract IDs
   *
   * @param params - Parameters including contract IDs and signer
   * @returns Promise with escrow data from indexer
   */
  const getByContractIds = async (params: GetEscrowFromIndexerByContractIdsParams) => {
    return getEscrowByContractIds(params);
  };

  /**
   * Get escrows by signer address
   *
   * @param params - Parameters including signer address and optional filters
   * @returns Promise with array of escrows
   */
  const getBySigner = async (params: GetEscrowsFromIndexerBySignerParams) => {
    return getEscrowsBySigner(params);
  };

  /**
   * Get escrows by role
   *
   * @param params - Parameters including role and role address
   * @returns Promise with array of escrows
   */
  const getByRole = async (params: GetEscrowsFromIndexerByRoleParams) => {
    return getEscrowsByRole(params);
  };

  /**
   * Get balances for multiple escrows
   *
   * @param params - Parameters including signer and escrow addresses
   * @param type - Escrow type ('single-release' or 'multi-release')
   * @returns Promise with array of escrow balances
   */
  const getBalances = async (params: GetBalanceParams, type: EscrowType) => {
    return getMultipleBalances(params, type);
  };

  /**
   * Send a signed transaction
   *
   * @param signedXdr - Signed transaction XDR
   * @returns Promise with send transaction response
   */
  const send = async (signedXdr: string) => {
    return sendTransaction(signedXdr);
  };

  /**
   * Update escrow from transaction hash
   *
   * @param payload - Payload containing transaction hash
   * @returns Promise with update response
   */
  const updateFromHash = async (payload: UpdateFromTxHashPayload) => {
    return updateFromTxHash(payload);
  };

  return {
    // Core operations
    initialize,
    fund,
    update,

    // Query operations
    getByContractIds,
    getBySigner,
    getByRole,
    getBalances,

    // Transaction operations
    sendTransaction: send,
    updateFromHash,
  };
}

/**
 * Type guard to check if escrow is single-release
 *
 * @param escrow - Escrow data to check
 * @returns True if escrow is single-release
 */
export function isSingleReleaseEscrow(escrow: any): boolean {
  return Array.isArray(escrow.milestones) && escrow.milestones.length > 0 &&
    'approved' in escrow.milestones[0];
}

/**
 * Type guard to check if escrow is multi-release
 *
 * @param escrow - Escrow data to check
 * @returns True if escrow is multi-release
 */
export function isMultiReleaseEscrow(escrow: any): boolean {
  return Array.isArray(escrow.milestones) && escrow.milestones.length > 0 &&
    'amount' in escrow.milestones[0] && 'flags' in escrow.milestones[0];
}
