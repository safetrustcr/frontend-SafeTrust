import { kit } from "./wallet-kit";
import { useWalletContext } from "./WalletProvider";
import { ISupportedWallet } from "@creit.tech/stellar-wallets-kit";

/**
 * Custom hook that provides wallet connection and disconnection functionality
 * Integrates with the Stellar Wallet Kit and manages wallet state through context
 */
export const useWallet = () => {
  // Get wallet management functions from the context
  const { setWalletInfo, clearWalletInfo } = useWalletContext();

  /**
   * Connect to a Stellar wallet using the Wallet Kit
   * Opens a modal for wallet selection and handles the connection process
   * Automatically sets wallet information in the context upon successful connection
   */
  const connectWallet = async () => {
    await kit.openModal({
      modalTitle: "Connect to your favorite wallet",
      onWalletSelected: async (option: ISupportedWallet) => {
        // Set the selected wallet as the active wallet
        kit.setWallet(option.id);

        // Get the wallet address and name
        const { address } = await kit.getAddress();
        const { name } = option;

        // Store wallet information in the context and localStorage
        setWalletInfo(address, name);
      },
    });
  };

  /**
   * Disconnect from the current wallet
   * Clears wallet information from the context and localStorage
   * Disconnects the wallet from the Stellar Wallet Kit
   */
  const disconnectWallet = async () => {
    await kit.disconnect();
    clearWalletInfo();
  };

  /**
   * Handle wallet connection with error handling
   * Wraps the connectWallet function in a try-catch block for better error management
   */
  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Error connecting wallet:", error);
      // You can add additional error handling here, such as showing user notifications
    }
  };

  /**
   * Handle wallet disconnection with error handling
   * Wraps the disconnectWallet function in a try-catch block for better error management
   */
  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      // You can add additional error handling here, such as showing user notifications
    }
  };

  return {
    connectWallet,
    disconnectWallet,
    handleConnect,
    handleDisconnect,
  };
};
