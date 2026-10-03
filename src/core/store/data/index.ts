// frontend-SafeTrust/src/core/store/data/index.ts

import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import type { AuthenticationGlobalStore } from "@/types/authentication";
import { useGlobalAuthenticationSlice } from "./slices/authentication.slice";

export const useGlobalAuthenticationStore = create<AuthenticationGlobalStore>()(
  persist(
    devtools(useGlobalAuthenticationSlice, { name: "AuthenticationStore" }),
    {
      name: "safetrust-wallet",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ address, name }) => ({ address, name }), // never persist tokens
    }
  )
);