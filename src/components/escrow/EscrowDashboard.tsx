'use client';

/**
 * EscrowDashboard Component
 *
 * Main dashboard for monitoring escrow status across different roles.
 * Integrates with TrustlessWork API endpoints to fetch and display escrows.
 *
 * API Endpoints integrated:
 * - GET /escrow/single-release/get-escrow - Get single-release escrow details
 * - GET /escrow/multi-release/get-escrow - Get multi-release escrow details
 * - GET /helper/get-escrows-by-signer - Get escrows by wallet address
 * - GET /helper/get-escrows-by-role - Get escrows by role (marker/approver/releaser)
 *
 * @example
 * ```tsx
 * <EscrowDashboard />
 * ```
 */

import { useMemo } from 'react';
import { EscrowCard } from './EscrowCard';
import { useEscrowsBySignerQuery } from '@/components/tw-blocks/tanstack/useEscrowsBySignerQuery';
import { useWalletContext } from '@/components/tw-blocks/wallet-kit/WalletProvider';
import type { GetEscrowsFromIndexerResponse } from '@trustless-work/escrow/types';

interface EscrowDashboardProps {
  /**
   * Optional custom wallet address (defaults to connected wallet)
   */
  walletAddress?: string;

  /**
   * Whether to validate escrows on-chain
   * @default true
   */
  validateOnChain?: boolean;

  /**
   * Callback when an escrow is clicked
   */
  onEscrowClick?: (escrow: GetEscrowsFromIndexerResponse) => void;

  /**
   * Custom class name for the dashboard container
   */
  className?: string;
}

/**
 * Escrow Status Monitoring Dashboard
 *
 * Displays escrows grouped by user role:
 * - As Guest (Approver): Escrows where user is the approver
 * - As Hotel (Marker): Escrows where user is the marker
 * - Platform Managed (Releaser): Escrows where user is the releaser
 */
export function EscrowDashboard({
  walletAddress,
  validateOnChain = true,
  onEscrowClick,
  className = '',
}: EscrowDashboardProps) {
  // Get wallet address from connected wallet or prop
  const { walletAddress: connectedAddress } = (useWalletContext?.() ?? {}) as { walletAddress?: string | null };
  const address = walletAddress || connectedAddress;

  // Fetch all escrows for the current signer
  const {
    data: myEscrows = [],
    isLoading,
    error,
    refetch,
  } = useEscrowsBySignerQuery({
    signer: address || '',
    enabled: !!address,
    validateOnChain,
    isActive: true, // Only fetch active escrows
  });

  // Filter escrows by role
  const escrowsByRole = useMemo(() => {
    if (!address || !myEscrows) {
      return {
        approver: [],
        marker: [],
        releaser: [],
      };
    }

    return {
      approver: myEscrows.filter(
        (e) => (e as any).roles?.approver?.toLowerCase() === address.toLowerCase()
      ),
      marker: myEscrows.filter(
        (e) => (e as any).roles?.marker?.toLowerCase() === address.toLowerCase()
      ),
      releaser: myEscrows.filter(
        (e) => (e as any).roles?.releaser?.toLowerCase() === address.toLowerCase()
      ),
    };
  }, [myEscrows, address]);

  // Handle wallet not connected
  if (!address) {
    return (
      <div className={`min-h-[400px] flex items-center justify-center ${className}`}>
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Wallet Not Connected
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Please connect your wallet to view your escrow dashboard
          </p>
          <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Escrow Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage your escrows across all roles
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
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
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Escrows"
          value={myEscrows.length}
          icon="clipboard"
          color="blue"
        />
        <StatCard
          title="As Approver"
          value={escrowsByRole.approver.length}
          icon="user"
          color="green"
        />
        <StatCard
          title="As Marker"
          value={escrowsByRole.marker.length}
          icon="building"
          color="blue"
        />
        <StatCard
          title="As Releaser"
          value={escrowsByRole.releaser.length}
          icon="shield"
          color="purple"
        />
      </div>

      {/* Main Grid - Escrow Cards by Role */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EscrowCard
          title="As Guest (Approver)"
          escrows={escrowsByRole.approver}
          role="approver"
          signer={address}
          isLoading={isLoading}
          error={error}
          onEscrowClick={onEscrowClick}
        />

        <EscrowCard
          title="As Hotel (Marker)"
          escrows={escrowsByRole.marker}
          role="marker"
          signer={address}
          isLoading={isLoading}
          error={error}
          onEscrowClick={onEscrowClick}
        />

        <EscrowCard
          title="Platform Managed"
          escrows={escrowsByRole.releaser}
          role="releaser"
          signer={address}
          isLoading={isLoading}
          error={error}
          onEscrowClick={onEscrowClick}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                Error Loading Escrows
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                {error.message || 'An unexpected error occurred'}
              </p>
              <button
                onClick={() => refetch()}
                className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                Try again →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            Status updates automatically every 30 seconds. Connected wallet: {address.substring(0, 8)}
            ...{address.substring(address.length - 6)}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Summary stat card component
 */
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: 'clipboard' | 'user' | 'building' | 'shield';
  color: 'blue' | 'green' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple:
      'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };

  const iconMap = {
    clipboard: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    ),
    user: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    ),
    building: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    ),
    shield: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {iconMap[icon]}
          </svg>
        </div>
      </div>
    </div>
  );
}
