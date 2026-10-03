// Hooks
export { useWallet } from "./hooks/wallet.hook";
export { useMultiWallet } from "./hooks/useMultiWallet";

// Components
export { WalletSelectionModal } from "./components/WalletSelectionModal";
export { default as ConnectionStatus } from "./ConnectionStatus";

// Types
export type * from "@/types/wallet";

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
export {
  kit,
  WALLET_IDS,
  signTransaction,
} from "./constants/wallet-kit.constant";
