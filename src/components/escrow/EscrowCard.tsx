'use client';

/**
 * EscrowCard Component
 *
 * Displays a card showing escrows filtered by role (guest/hotel/platform).
 * Shows a summary count and list of escrows for a specific role.
 *
 * @example
 * ```tsx
 * <EscrowCard
 *   title="As Guest (Approver)"
 *   escrows={escrows}
 *   role="approver"
 *   signer="WALLET_ADDRESS"
 * />
 * ```
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EscrowStatusBadge } from './EscrowStatusBadge';
import type { GetEscrowsFromIndexerResponse } from '@trustless-work/escrow/types';

interface EscrowCardProps {
  /**
   * Card title (e.g., "As Guest (Approver)")
   */
  title: string;

  /**
   * Array of escrows to display
   */
  escrows?: GetEscrowsFromIndexerResponse[];

  /**
   * The role type (marker/approver/releaser)
   */
  role: 'marker' | 'approver' | 'releaser';

  /**
   * The wallet address of the current user (used for status polling)
   */
  signer: string;

  /**
   * Whether the data is currently loading
   */
  isLoading?: boolean;

  /**
   * Error message if any
   */
  error?: Error | null;

  /**
   * Callback when an escrow is clicked
   */
  onEscrowClick?: (escrow: GetEscrowsFromIndexerResponse) => void;
}

/**
 * Card component to display escrows by role
 */
export function EscrowCard({
  title,
  escrows = [],
  role,
  signer,
  isLoading = false,
  error = null,
  onEscrowClick,
}: EscrowCardProps) {
  // Get role icon
  const roleIcon = getRoleIcon(role);
  const roleColor = getRoleColor(role);

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <span className={roleColor}>{roleIcon}</span>
            {title}
          </span>
          <span className={`text-2xl font-bold ${roleColor}`}>
            {escrows.length}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary dark:border-white"></div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="text-center py-8">
            <div className="text-red-500 dark:text-red-400 text-sm mb-2">Failed to load escrows</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{error.message}</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && escrows.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No escrows found</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Escrows where you are the {role} will appear here
            </p>
          </div>
        )}

        {/* Escrows list */}
        {!isLoading && !error && escrows.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {escrows.slice(0, 10).map((escrow) => (
              <EscrowItem
                key={escrow.contractId}
                escrow={escrow}
                signer={signer}
                onClick={() => onEscrowClick?.(escrow)}
              />
            ))}

            {escrows.length > 10 && (
              <div className="text-center pt-2 border-t">
                <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  View all {escrows.length} escrows →
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Individual escrow item component
 */
function EscrowItem({
  escrow,
  signer,
  onClick,
}: {
  escrow: GetEscrowsFromIndexerResponse;
  signer: string;
  onClick?: () => void;
}) {
  // Extract escrow details
  const title = escrow.title || 'Untitled Escrow';
  const amount = escrow.amount || 0;
  const asset = (escrow as any).asset?.code || 'XLM';
  const contractId: string | undefined = (escrow as any).contractId ?? undefined;
  const createdAt = escrow.createdAt
    ? new Date((escrow as any).createdAt as any).toLocaleDateString()
    : 'N/A';

  return (
    <div
      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold truncate dark:text-white">{title}</h4>
          {contractId ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {contractId.substring(0, 8)}...{contractId.substring(contractId.length - 6)}
            </p>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">Missing contract ID</p>
          )}
        </div>
        {contractId && (
          <EscrowStatusBadge
            escrowId={contractId}
            signer={signer}
            className="flex-shrink-0"
          />
        )}
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-semibold">
            {formatAmount(amount)} {asset}
          </span>
        </div>
        <span className="text-gray-500 dark:text-gray-400">{createdAt}</span>
      </div>
    </div>
  );
}

/**
 * Get icon for role
 */
function getRoleIcon(role: 'marker' | 'approver' | 'releaser') {
  switch (role) {
    case 'marker':
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      );
    case 'approver':
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      );
    case 'releaser':
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      );
  }
}

/**
 * Get color for role
 */
function getRoleColor(role: 'marker' | 'approver' | 'releaser') {
  switch (role) {
    case 'marker':
      return 'text-blue-600 dark:text-blue-400';
    case 'approver':
      return 'text-green-600 dark:text-green-400';
    case 'releaser':
      return 'text-purple-600 dark:text-purple-400';
  }
}

/**
 * Format amount with proper decimals
 */
function formatAmount(amount: number): string {
  // Convert from stroops (7 decimal places) to standard units
  const formattedAmount = amount / 10000000;
  return formattedAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}
