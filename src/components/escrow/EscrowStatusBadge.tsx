'use client';

/**
 * EscrowStatusBadge Component
 *
 * Displays the real-time status of an escrow with automatic polling.
 * Updates every 30 seconds by default to show the latest escrow status.
 *
 * @example
 * ```tsx
 * <EscrowStatusBadge
 *   escrowId="CONTRACT_ID"
 *   signer="WALLET_ADDRESS"
 *   refetchInterval={30000}
 * />
 * ```
 */

import { Badge } from '@/components/ui/badge';
import {
  useEscrowStatus,
  getEscrowStatusString,
  getStatusVariant,
  formatStatus,
} from './hook/useEscrowStatus';

interface EscrowStatusBadgeProps {
  /**
   * The contract ID of the escrow
   */
  escrowId: string;

  /**
   * The wallet address of the signer
   */
  signer: string;

  /**
   * Optional refetch interval in milliseconds
   * @default 30000 (30 seconds)
   */
  refetchInterval?: number;

  /**
   * Whether to validate the escrow status on-chain
   * @default true
   */
  validateOnChain?: boolean;

  /**
   * Additional CSS classes to apply to the badge
   */
  className?: string;

  /**
   * Whether to show a loading indicator
   * @default true
   */
  showLoading?: boolean;
}

/**
 * Real-time escrow status badge component
 *
 * Automatically polls the escrow status at the specified interval
 * and displays it with appropriate styling based on the status.
 */
export function EscrowStatusBadge({
  escrowId,
  signer,
  refetchInterval = 30000,
  validateOnChain = true,
  className = '',
  showLoading = true,
}: EscrowStatusBadgeProps) {
  const {
    data: escrow,
    isLoading,
    error,
  } = useEscrowStatus({
    contractId: escrowId,
    signer,
    refetchInterval,
    validateOnChain,
  });

  // Handle loading state
  if (isLoading && showLoading) {
    return (
      <Badge variant="outline" className={className}>
        <span className="flex items-center gap-1">
          <span className="animate-pulse">Loading...</span>
        </span>
      </Badge>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Badge variant="destructive" className={className}>
        Error
      </Badge>
    );
  }

  // Get the status string and variant
  const status = getEscrowStatusString(escrow);
  const variant = getStatusVariant(status);
  const formattedStatus = formatStatus(status);

  return (
    <Badge variant={variant} className={className}>
      <span className="flex items-center gap-1">
        <StatusIcon status={status} />
        {formattedStatus}
      </span>
    </Badge>
  );
}

/**
 * Status icon component
 */
function StatusIcon({ status }: { status: string }) {
  const statusLower = status.toLowerCase();

  // Success states
  if (statusLower === 'released' || statusLower === 'completed') {
    return (
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    );
  }

  // In progress states
  if (
    statusLower === 'working' ||
    statusLower === 'pending' ||
    statusLower === 'funded' ||
    statusLower === 'pendingrelease'
  ) {
    return (
      <svg
        className="w-3 h-3 animate-spin"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    );
  }

  // Dispute/error states
  if (
    statusLower === 'indispute' ||
    statusLower === 'disputed' ||
    statusLower === 'cancelled' ||
    statusLower === 'failed'
  ) {
    return (
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    );
  }

  // Default/unknown state
  return (
    <svg
      className="w-3 h-3"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
