import { StateCreator } from "zustand";
import { AuthenticationGlobalStore } from "../@types/authentication.entity";

const AUTHENTICATION_ACTIONS = {
  CONNECT_WALLET: "authentication/connect",
  DISCONNECT_WALLET: "authentication/disconnect",
  SET_TOKEN: "authentication/set-token",
  CLEAR_AUTH: "authentication/clear",
} as const;

export const useGlobalAuthenticationSlice: StateCreator<
  AuthenticationGlobalStore,
  [["zustand/devtools", never]],
  [],
  AuthenticationGlobalStore
> = (set) => {
  return {
    // Stores
    address: "",
    name: "",
    token: null,

    // Modifiers
    connectWalletStore: async (address: string, name: string) => {
      set({ address, name }, false, AUTHENTICATION_ACTIONS.CONNECT_WALLET);
    },

    disconnectWalletStore: () =>
      set(
        { address: "", name: "" },
        false,
        AUTHENTICATION_ACTIONS.DISCONNECT_WALLET,
      ),

    setToken: (token: string | null) =>
      set(
        { token },
        false,
        AUTHENTICATION_ACTIONS.SET_TOKEN,
      ),

    clearAuth: () =>
      set(
        { address: "", name: "", token: null },
        false,
        AUTHENTICATION_ACTIONS.CLEAR_AUTH,
      ),
  };
};
