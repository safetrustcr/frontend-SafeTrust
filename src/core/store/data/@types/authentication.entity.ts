export interface AuthenticationGlobalStore {
  address: string;
  name: string;
  token: string | null;

  connectWalletStore: (address: string, name: string) => void;
  disconnectWalletStore: () => void;
  setToken: (token: string | null) => void;
  clearAuth: () => void;
}
