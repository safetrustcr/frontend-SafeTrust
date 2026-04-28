export interface AuthenticationGlobalStore {
  address: string;
  name: string;
  token: string;

  connectWalletStore: (address: string, name: string) => void;
  setToken: (token: string) => void;
  disconnectWalletStore: () => void;
  setToken: (token: string) => void;
}
