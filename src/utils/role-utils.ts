import { useGlobalAuthenticationStore } from "@/core/store/data";

type UserRole = 'admin' | 'hotel' | 'guest' | null;

export function getUserRole(): UserRole {
  const address = useGlobalAuthenticationStore.getState().address;
  
  if (!address) {
    return null;
  }

  try {
    if (address.startsWith('0xadmin') || address.includes('admin')) {
      return 'admin';
    } else if (address.startsWith('0xhotel') || address.includes('hotel')) {
      return 'hotel';
    } else {
      return 'guest';
    }
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}