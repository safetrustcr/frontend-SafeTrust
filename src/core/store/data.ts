import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 1. Update the Interface to include clearAuth
interface AuthenticationGlobalStore {
  token: string | null;
  address: string | null;
  setAuth: (token: string, address: string) => void;
  clearAuth: () => void; // <--- This line fixes the "Property does not exist" error
}

// 2. Update the Store Implementation
export const useGlobalAuthenticationStore = create<AuthenticationGlobalStore>()(
  persist(
    (set) => ({
      token: null,
      address: null,

      setAuth: (token, address) => set({ token, address }),

      // 3. Add the actual function logic
      clearAuth: () => set({ token: null, address: null }),
    }),
    {
      name: 'safetrust-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);