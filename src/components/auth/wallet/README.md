# Multi-Wallet Integration for SafeTrust

This directory contains a comprehensive multi-wallet integration system for the SafeTrust frontend, supporting multiple blockchain networks and wallet types.

## Features

### Supported Wallets

- **Stellar Wallets**: Freighter, Albedo, LOBSTR
- **Ethereum/BSC Wallets**: MetaMask, WalletConnect (planned)

### Key Components

#### Hooks

- `useMultiWallet()` - Main hook for multi-wallet management
- `useWalletDetection()` - Detects available wallets in browser
- `useWallet()` - Legacy hook updated to work with new system

#### Components

- `WalletConnectionModal` - Main modal for wallet selection
- `WalletOption` - Individual wallet connection option
- `ConnectionStatus` - Display connected wallets
- `WalletDetection` - Show detected wallets

#### Types

- Comprehensive TypeScript interfaces for wallet types
- Support for multiple chains (Stellar, Ethereum, BSC)
- Connection states and error handling

#### Utils

- `walletConfig.ts` - Wallet configuration and metadata
- `walletValidation.ts` - Address validation and formatting

## Usage

### Basic Usage

```tsx
import {
  useMultiWallet,
  WalletConnectionModal,
} from "@/components/auth/wallet";

function MyComponent() {
  const { connectedWallets, selectedWallet, connectWallet, disconnectWallet } =
    useMultiWallet();

  return (
    <div>
      <button onClick={() => connectWallet("freighter")}>
        Connect Freighter
      </button>

      <WalletConnectionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onWalletConnected={(wallet) => console.log("Connected:", wallet)}
      />
    </div>
  );
}
```

### Integration with Auth System

The wallet system integrates with the existing Zustand authentication store:

```tsx
import { useWallet } from "./wallet/hooks/wallet.hook";

function LoginComponent() {
  const {
    handleConnect,
    showWalletModal,
    setShowWalletModal,
    handleMultiWalletConnect,
  } = useWallet();

  return (
    <>
      <button onClick={handleConnect}>Connect Wallet</button>

      <WalletConnectionModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onWalletConnected={handleMultiWalletConnect}
      />
    </>
  );
}
```

## Configuration

### Stellar Wallets Configuration

The Stellar Wallets Kit is configured in `constants/wallet-kit.constant.ts`:

```ts
export const kit: StellarWalletsKit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: [new FreighterModule(), new AlbedoModule(), new LobstrModule()],
  modalParams: {
    modalTitle: "Connect to your favorite wallet",
    theme: {
      // Custom theme matching SafeTrust design
    },
  },
});
```

### Wallet Configurations

Wallet metadata is configured in `utils/walletConfig.ts`:

```ts
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
  // ... more wallets
};
```

## Architecture

### File Structure

```
src/components/auth/wallet/
├── README.md                       # This documentation
├── index.ts                        # Main exports
├── types/
│   └── wallet.types.ts             # TypeScript interfaces
├── hooks/
│   ├── useMultiWallet.ts          # Main multi-wallet hook
│   ├── useWalletDetection.ts      # Wallet detection
│   └── wallet.hook.ts             # Enhanced legacy hook
├── components/
│   ├── WalletConnectionModal.tsx   # Main connection modal
│   ├── WalletOption.tsx           # Individual wallet option
│   ├── ConnectionStatus.tsx       # Connected wallets display
│   └── WalletDetection.tsx        # Wallet detection display
├── utils/
│   ├── walletConfig.ts            # Wallet configurations
│   └── walletValidation.ts        # Address validation
└── constants/
    └── wallet-kit.constant.ts     # Stellar Wallets Kit config
```

### State Management

The system uses multiple state management approaches:

1. **Local Component State** - For UI state (modals, loading states)
2. **Multi-Wallet Hook State** - For wallet connections and selections
3. **Global Zustand Store** - For authenticated user state

### Type Safety

Comprehensive TypeScript interfaces ensure type safety:

```ts
export interface WalletInfo {
  address: string;
  name: string;
  chain: ChainType;
  connectionStatus: ConnectionStatus;
  walletType: WalletType;
}

export interface StellarWalletInfo extends WalletInfo {
  chain: "stellar";
  balances?: Balance[];
  publicKey: string;
}
```

## Integration with Existing Components

### Login Component

The Login component has been updated to use the new multi-wallet modal while maintaining backward compatibility:

```tsx
// Before
<Button onClick={handleConnect}>Login with wallet</Button>

// After - same interface, enhanced functionality
<Button onClick={handleConnect}>Login with wallet</Button>
<WalletConnectionModal
  isOpen={showWalletModal}
  onClose={() => setShowWalletModal(false)}
  onWalletConnected={handleMultiWalletConnect}
/>
```

## Future Enhancements

1. **WalletConnect Integration** - Full WalletConnect v2 support
2. **Hardware Wallet Support** - Ledger integration
3. **Mobile Wallet Support** - Deep linking for mobile wallets
4. **Chain Switching** - Dynamic network switching
5. **Wallet State Persistence** - Remember connected wallets
6. **Transaction History** - Multi-chain transaction tracking

## Development Notes

### Testing

- Components are designed to work in development mode
- Stellar testnet is used by default
- Mock wallet detection for testing environments

### Error Handling

- Comprehensive error handling with user-friendly messages
- Network-specific error messages
- Graceful fallbacks for unsupported wallets

### Performance

- Lazy loading of wallet detection
- Efficient re-renders with proper memoization
- Minimal bundle size impact with tree-shaking

## Dependencies

```json
{
  "@creit.tech/stellar-wallets-kit": "^1.5.0",
  "stellar-sdk": "^13.3.0",
  "react": "^18.2.0",
  "next": "^15.3.0"
}
```
