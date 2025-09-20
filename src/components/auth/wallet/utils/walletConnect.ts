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
  } catch (error) {
    console.error('WalletConnect connection failed:', error);
    throw error;
  }
};

export const disconnectWalletConnect = async () => {
  if (ethereumProvider) {
    try {
      await ethereumProvider.disconnect();
      ethereumProvider = null;
    } catch (error) {
      console.error('Failed to disconnect WalletConnect:', error);
    }
  }
};

export const getWalletConnectProvider = () => ethereumProvider;