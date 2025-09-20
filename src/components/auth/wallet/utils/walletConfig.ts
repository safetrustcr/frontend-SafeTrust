import { WalletType } from '../types/wallet.types';

export interface WalletConfig {
  id: WalletType;
  name: string;
  description: string;
  icon: string;
  downloadUrl?: string;
  chains: ('stellar' | 'ethereum' | 'bsc')[];
  isPopular?: boolean;
}

export const WALLET_CONFIGS: Record<WalletType, WalletConfig> = {
  freighter: {
    id: 'freighter',
    name: 'Freighter',
    description: 'The most popular Stellar wallet browser extension',
    icon: '🚀',
    downloadUrl: 'https://freighter.app/',
    chains: ['stellar'],
    isPopular: true,
  },
  albedo: {
    id: 'albedo',
    name: 'Albedo',
    description: 'Secure Stellar wallet with advanced features',
    icon: '⭐',
    downloadUrl: 'https://albedo.link/',
    chains: ['stellar'],
    isPopular: true,
  },
  lobstr: {
    id: 'lobstr',
    name: 'LOBSTR',
    description: 'Simple and secure Stellar wallet',
    icon: '🦞',
    downloadUrl: 'https://lobstr.co/',
    chains: ['stellar'],
  },
  metamask: {
    id: 'metamask',
    name: 'MetaMask',
    description: 'The leading Ethereum wallet',
    icon: '🦊',
    downloadUrl: 'https://metamask.io/',
    chains: ['ethereum', 'bsc'],
    isPopular: true,
  },
  walletconnect: {
    id: 'walletconnect',
    name: 'WalletConnect',
    description: 'Connect to hundreds of wallets',
    icon: '🔗',
    chains: ['ethereum', 'bsc'],
  },
};

export const STELLAR_WALLETS: WalletType[] = ['freighter', 'albedo', 'lobstr'];
export const ETHEREUM_WALLETS: WalletType[] = ['metamask', 'walletconnect'];
export const POPULAR_WALLETS: WalletType[] = Object.keys(WALLET_CONFIGS)
  .filter(key => WALLET_CONFIGS[key as WalletType].isPopular)
  .map(key => key as WalletType);

export const getWalletConfig = (walletType: WalletType): WalletConfig => {
  return WALLET_CONFIGS[walletType];
};

export const getWalletsByChain = (chain: 'stellar' | 'ethereum' | 'bsc'): WalletConfig[] => {
  return Object.values(WALLET_CONFIGS).filter(config => 
    config.chains.includes(chain)
  );
};

export const getAllSupportedWallets = (): WalletConfig[] => {
  return Object.values(WALLET_CONFIGS);
};