import type { WalletType } from "@/types/wallet";

export interface WalletConfig {
  id: WalletType;
  name: string;
  description: string;
  icon: string;
  downloadUrl?: string;
  chains: "stellar"[];
  isPopular?: boolean;
}

export const WALLET_CONFIGS: Record<WalletType, WalletConfig> = {
  freighter: {
    id: "freighter",
    name: "Freighter",
    description: "The most popular Stellar wallet browser extension",
    icon: "🚀",
    downloadUrl: "https://freighter.app/",
    chains: ["stellar"],
    isPopular: true,
  },
  albedo: {
    id: "albedo",
    name: "Albedo",
    description: "Secure Stellar wallet with advanced features",
    icon: "⭐",
    downloadUrl: "https://albedo.link/",
    chains: ["stellar"],
    isPopular: true,
  },
  lobstr: {
    id: "lobstr",
    name: "LOBSTR",
    description: "Simple and secure Stellar wallet",
    icon: "🦞",
    downloadUrl: "https://lobstr.co/",
    chains: ["stellar"],
    isPopular: true,
  },
};

export const STELLAR_WALLETS: WalletType[] = ["freighter", "albedo", "lobstr"];
export const POPULAR_WALLETS: WalletType[] = Object.keys(WALLET_CONFIGS)
  .filter((key) => WALLET_CONFIGS[key as WalletType].isPopular)
  .map((key) => key as WalletType);

export const getWalletConfig = (walletType: WalletType): WalletConfig => {
  return WALLET_CONFIGS[walletType];
};

export const getWalletsByChain = (chain: "stellar"): WalletConfig[] => {
  return Object.values(WALLET_CONFIGS).filter((config) =>
    config.chains.includes(chain),
  );
};

export const getAllSupportedWallets = (): WalletConfig[] => {
  return Object.values(WALLET_CONFIGS);
};
