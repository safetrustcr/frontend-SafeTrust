import EthereumProvider from '@walletconnect/ethereum-provider';

// WalletConnect Project ID - Replace with your actual project ID from WalletConnect Cloud
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

let ethereumProvider: EthereumProvider | null = null;

export const initializeWalletConnect = async () => {
  if (ethereumProvider) {
    return ethereumProvider;
  }

  try {
    ethereumProvider = await EthereumProvider.init({
      projectId: WALLETCONNECT_PROJECT_ID,
      chains: [1, 56], // Ethereum mainnet and BSC
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'light',
        themeVariables: {
          '--wcm-z-index': '99999', // Higher z-index than our modal
        }
      },
      metadata: {
        name: 'SafeTrust',
        description: 'SafeTrust - Secure P2P Transactions',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://safetrust.com',
        icons: [typeof window !== 'undefined' ? `${window.location.origin}/img/logo.png` : 'https://safetrust.com/logo.png']
      }
    });

    return ethereumProvider;
  } catch (error) {
    console.error('Failed to initialize WalletConnect:', error);
    throw error;
  }
};

export const connectWalletConnect = async () => {
  try {
    // Always create a fresh provider instance for each connection attempt
    // This prevents stale connection states
    ethereumProvider = null;
    
    const provider = await initializeWalletConnect();
    
    // Enable the provider (connects to wallet)
    const accounts = await provider.enable();
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts returned from WalletConnect');
    }

    // Get chain ID
    const chainId = await provider.request({ method: 'eth_chainId' });
    
    return {
      address: accounts[0],
      chainId: parseInt(chainId as string, 16),
      provider
    };
  } catch (error: any) {
    // Clean up provider on any error
    ethereumProvider = null;
    
    // Handle specific WalletConnect errors gracefully
    if (error?.message?.includes('Connection request reset') || 
        error?.message?.includes('User rejected') ||
        error?.message?.includes('User cancelled') ||
        error?.message?.includes('User closed modal') ||
        error?.code === 4001) {
      // User cancelled - don't throw error, just return null
      return null;
    }
    
    console.error('WalletConnect connection failed:', error);
    throw error;
  }
};

export const disconnectWalletConnect = async () => {
  if (ethereumProvider) {
    try {
      await ethereumProvider.disconnect();
    } catch (error) {
      console.error('Failed to disconnect WalletConnect:', error);
    } finally {
      ethereumProvider = null;
    }
  }
};

export const getWalletConnectProvider = () => ethereumProvider;

export const cleanupWalletConnect = async () => {
  if (ethereumProvider) {
    try {
      // Disconnect if connected
      if (ethereumProvider.connected) {
        await ethereumProvider.disconnect();
      }
    } catch (error) {
      // Ignore cleanup errors
      console.debug('WalletConnect cleanup error (ignored):', error);
    } finally {
      ethereumProvider = null;
    }
  }
};