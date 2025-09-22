// Components
export { default as WalletConnectionModal } from "./WalletConnectionModal";
export { default as WalletOption } from "./WalletOption";
export { default as WalletDetection } from "./WalletDetection";
export { default as ConnectionStatus } from "./ConnectionStatus";

// Hooks
export { useWallet } from "./hooks/wallet.hook";
export { useMultiWallet } from "./hooks/useMultiWallet";
export {
  useWalletDetection,
  getAvailableWallets,
  isWalletAvailable,
} from "./hooks/useWalletDetection";

// Types
export type * from "./types/wallet.types";

// Utils
export {
  getWalletConfig,
  getWalletsByChain,
  getAllSupportedWallets,
  STELLAR_WALLETS,
  ETHEREUM_WALLETS,
  POPULAR_WALLETS,
  WALLET_CONFIGS,
} from "./utils/walletConfig";

export {
  isValidStellarAddress,
  isValidEthereumAddress,
  isValidBSCAddress,
  isValidAddress,
  formatAddress,
  detectChainFromAddress,
  validateWalletConnection,
} from "./utils/walletValidation";

// Constants
export { kit, signTransaction } from "./constants/wallet-kit.constant";
