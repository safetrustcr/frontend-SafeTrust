/**
 * Wallet address validation utilities for Stellar blockchain
 */

import type { ChainType } from "@/types/wallet";

/**
 * Validates a Stellar public key
 * @param address - The Stellar public key to validate
 * @returns boolean indicating if the address is valid
 */
export const isValidStellarAddress = (address: string): boolean => {
  // Stellar public keys start with 'G' and are 56 characters long
  const stellarRegex = /^G[A-Z2-7]{55}$/;
  return stellarRegex.test(address);
};

/**
 * Validates an address based on the chain type
 * @param address - The address to validate
 * @param chain - The blockchain network
 * @returns boolean indicating if the address is valid
 */
export const isValidAddress = (address: string, chain: "stellar"): boolean => {
  if (chain === "stellar") {
    return isValidStellarAddress(address);
  }
  return false;
};

/**
 * Formats an address for display (truncates middle part)
 * @param address - The full address
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns formatted address string
 */
export const formatAddress = (
  address: string,
  startChars: number = 6,
  endChars: number = 4,
): string => {
  if (!address || address.length <= startChars + endChars) {
    return address;
  }

  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Detects the chain type based on address format
 * @param address - The address to analyze
 * @returns the detected chain type or null if unknown
 */
export const detectChainFromAddress = (address: string): "stellar" | null => {
  if (isValidStellarAddress(address)) {
    return "stellar";
  }

  return null;
};

/**
 * Validates wallet connection parameters
 * @param params - Connection parameters
 * @returns validation result with errors if any
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateWalletConnection = (params: {
  address?: string;
  chain?: string;
  walletType?: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!params.address) {
    errors.push("Address is required");
  } else if (!params.chain) {
    errors.push("Chain type is required");
  } else if (!isValidAddress(params.address, params.chain as ChainType)) {
    errors.push(`Invalid address format for ${params.chain} chain`);
  }

  if (!params.walletType) {
    errors.push("Wallet type is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
