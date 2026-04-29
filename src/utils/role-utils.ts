/**
 * Role detection utilities for SafeTrust application
 * 
 * This file provides utilities for detecting and managing user roles
 * throughout the application.
 */

export type UserRole = 'guest' | 'hotel' | 'admin' | null;

/**
 * Get the current user's role based on wallet address and other factors
 * 
 * For now, this is a basic implementation that can be extended to:
 * - Check against a user database
 * - Verify role from blockchain data
 * - Use JWT tokens or other auth mechanisms
 * 
 * @returns The user's role or null if no role is detected
 */
export function getUserRole(): UserRole {
  // For demo purposes, we'll use a simple address-based role detection
  // In production, this should be replaced with proper authentication
  
  const storedAddress = localStorage.getItem('address-wallet');
  
  if (!storedAddress) {
    return null;
  }

  try {
    const { address } = JSON.parse(storedAddress);
    
    // Demo role assignment based on address patterns
    // In production, this should be replaced with actual role verification
    if (address.startsWith('0xadmin') || address.includes('admin')) {
      return 'admin';
    } else if (address.startsWith('0xhotel') || address.includes('hotel')) {
      return 'hotel';
    } else {
      return 'guest';
    }
  } catch (error) {
    console.error('Error parsing stored wallet data:', error);
    return null;
  }
}

/**
 * Check if a user has the required role or higher privilege
 * 
 * @param userRole The current user's role
 * @param requiredRole The minimum required role
 * @returns Whether the user has sufficient privileges
 */
export function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  if (!userRole || !requiredRole) {
    return false;
  }

  // Role hierarchy: admin > hotel > guest
  const roleHierarchy = {
    guest: 1,
    hotel: 2,
    admin: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Get redirect path based on user role
 * 
 * @param userRole The user's role
 * @returns The appropriate dashboard path for the role
 */
export function getRoleBasedRedirect(userRole: UserRole): string {
  switch (userRole) {
    case 'guest':
      return '/dashboard/guest';
    case 'hotel':
    case 'admin':
      return '/dashboard/manager';
    default:
      return '/dashboard';
  }
}
