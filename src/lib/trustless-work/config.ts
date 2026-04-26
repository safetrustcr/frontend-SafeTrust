/**
 * TrustlessWork SDK Configuration
 *
 * This file contains configuration settings for the TrustlessWork escrow SDK.
 * It handles environment-specific settings and API configuration.
 *
 * @see https://docs.trustlesswork.com/trustless-work/react-library-hooks/getting-started
 */

import type { TrustlessWorkConfigOptions } from './types';

/**
 * Environment URLs for TrustlessWork API
 */
export const TRUSTLESS_WORK_API_URLS = {
  production: 'https://api.trustlesswork.com',
  development: 'https://dev.api.trustlesswork.com',
} as const;

/**
 * Get the TrustlessWork configuration from environment variables
 *
 * @returns {TrustlessWorkConfigOptions} Configuration object for TrustlessWork
 * @throws {Error} If required environment variables are missing
 */
export function getTrustlessWorkConfig(): TrustlessWorkConfigOptions {
  const apiKey = TRUSTLESS_WORK_API_URLS.production || '';
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Determine the base URL based on environment
  const baseURL = isDevelopment
    ? (process.env.NEXT_PUBLIC_TRUSTLESS_API_URL_DEV || TRUSTLESS_WORK_API_URLS.development)
    : (process.env.NEXT_PUBLIC_TRUSTLESS_API_URL || TRUSTLESS_WORK_API_URLS.production);

  // Get the network configuration (defaults to testnet in development)
  const network = (process.env.NEXT_PUBLIC_TRUSTLESS_NETWORK as 'testnet' | 'mainnet') ||
    (isDevelopment ? 'testnet' : 'mainnet');

  if (!apiKey) {
    console.warn(
      'TrustlessWork API key is missing. Please set NEXT_PUBLIC_API_KEY in your .env file.'
    );
  }

  return {
    baseURL,
    apiKey: apiKey || '',
    network,
  };
}

/**
 * Validate TrustlessWork configuration
 *
 * @param {TrustlessWorkConfigOptions} config - Configuration to validate
 * @returns {boolean} True if configuration is valid
 */
export function validateTrustlessWorkConfig(
  config: TrustlessWorkConfigOptions
): boolean {
  if (!config.apiKey) {
    console.error('TrustlessWork: API key is required');
    return false;
  }

  if (!config.baseURL) {
    console.error('TrustlessWork: Base URL is required');
    return false;
  }

  // Validate URL format
  try {
    new URL(config.baseURL);
  } catch (error) {
    console.error('TrustlessWork: Invalid base URL format');
    return false;
  }

  return true;
}

/**
 * Export commonly used constants
 */
export const TRUSTLESS_WORK_CONSTANTS = {
  /**
   * API URLs
   */
  API_URLS: TRUSTLESS_WORK_API_URLS,

  /**
   * Escrow types
   */
  ESCROW_TYPES: {
    SINGLE_RELEASE: 'single-release' as const,
    MULTI_RELEASE: 'multi-release' as const,
  },

  /**
   * Network types
   */
  NETWORKS: {
    TESTNET: 'testnet' as const,
    MAINNET: 'mainnet' as const,
  },

  /**
   * Escrow statuses
   */
  ESCROW_STATUSES: {
    WORKING: 'working' as const,
    PENDING_RELEASE: 'pendingRelease' as const,
    RELEASED: 'released' as const,
    RESOLVED: 'resolved' as const,
    IN_DISPUTE: 'inDispute' as const,
  },

  /**
   * Request statuses
   */
  REQUEST_STATUSES: {
    SUCCESS: 'SUCCESS' as const,
    FAILED: 'FAILED' as const,
  },
} as const;
