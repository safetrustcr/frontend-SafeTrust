import { persist } from "zustand/middleware";
import { create } from "zustand";
import { useGlobalAuthenticationSlice } from "./slices/authentication.slice";
import { AuthenticationGlobalStore } from "./@types/authentication.entity";

type AuthState = AuthenticationGlobalStore;

export const useGlobalAuthenticationStore = create<AuthState>()(
  persist(
    (...b) => ({
      ...useGlobalAuthenticationSlice(...b),
    }),
    {
      name: "address-wallet",
    },
  ),
);
