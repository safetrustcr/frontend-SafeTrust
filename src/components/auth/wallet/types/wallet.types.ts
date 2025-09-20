export type WalletType = 'freighter' | 'albedo' | 'lobstr' | 'metamask' | 'walletconnect';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type ChainType = 'stellar' | 'ethereum' | 'bsc';

export interface WalletInfo {
  address: string;
  name: string;
  chain: ChainType;
  connectionStatus: ConnectionStatus;
  walletType: WalletType;
}

export interface WalletError {
  code: string;
  message: string;
  details?: any;
}

export interface Balance {
  balance: string;
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  buying_liabilities?: string;
  selling_liabilities?: string;
}

export interface PaymentOptions {
  to: string;
  amount: string;
  asset?: 'XLM' | { code: string; issuer: string };
  memo?: string;
  secret?: string;
}

export interface StellarWalletInfo extends WalletInfo {
  chain: 'stellar';
  balances?: Balance[];
  publicKey: string;
}

export interface EthereumWalletInfo extends WalletInfo {
  chain: 'ethereum' | 'bsc';
  balance?: string;
  chainId?: number;
}

export interface FreighterWallet {
  id: 'freighter';
  name: string;
  isAvailable: boolean;
  publicKey?: string;
  isConnected: boolean;
}

export interface AlbedoWallet {
  id: 'albedo';
  name: string;
  isAvailable: boolean;
  publicKey?: string;
  isConnected: boolean;
}

export interface LobstrWallet {
  id: 'lobstr';
  name: string;
  isAvailable: boolean;
  publicKey?: string;
  isConnected: boolean;
}

export interface MetaMaskWallet {
  id: 'metamask';
  name: string;
  isAvailable: boolean;
  address?: string;
  isConnected: boolean;
  chainId?: number;
}

export interface WalletConnectProvider {
  id: 'walletconnect';
  name: string;
  isAvailable: boolean;
  address?: string;
  isConnected: boolean;
  chainId?: number;
}

export interface WalletState {
  connectedWallets: WalletInfo[];
  selectedWallet?: WalletInfo;
  isConnecting: boolean;
  error?: WalletError;
}

export interface ConnectionState {
  status: ConnectionStatus;
  wallet?: WalletInfo;
  error?: WalletError;
}

export type WalletAction = 
  | { type: 'CONNECT_START'; payload: { walletType: WalletType } }
  | { type: 'CONNECT_SUCCESS'; payload: { wallet: WalletInfo } }
  | { type: 'CONNECT_ERROR'; payload: { error: WalletError } }
  | { type: 'DISCONNECT'; payload: { walletType: WalletType } }
  | { type: 'SELECT_WALLET'; payload: { wallet: WalletInfo } }
  | { type: 'RESET' };

export interface StellarWalletState {
  connected: boolean;
  publicKey?: string;
  walletName?: string;
  balances: Balance[];
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalances: () => Promise<void>;
  sendPayment?: (opts: PaymentOptions) => Promise<any>;
}

export interface MultiWalletState {
  connectedWallets: WalletInfo[];
  selectedWallet?: WalletInfo;
  isConnecting: boolean;
  error?: WalletError;
  connectWallet: (walletType: WalletType) => Promise<void>;
  disconnectWallet: (walletType: WalletType) => Promise<void>;
  selectWallet: (wallet: WalletInfo) => void;
  reset: () => void;
}

export interface WalletDetectionResult {
  freighter: boolean;
  albedo: boolean;
  lobstr: boolean;
  metamask: boolean;
  walletconnect: boolean;
}