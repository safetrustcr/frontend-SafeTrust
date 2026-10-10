# Stellar Wallet Integration for SafeTrust

This directory contains the Stellar wallet integration system for the SafeTrust frontend, supporting Stellar blockchain wallets.

## Features

### Supported Wallets

- **Stellar Wallets**: Freighter, Albedo, LOBSTR

### Key Components

#### Hooks

- `useMultiWallet()` - Main hook for wallet management
- `useWalletDetection()` - Detects available wallets in browser
- `useWallet()` - Legacy hook updated to work with the system

#### Components

- `WalletConnectionModal` - Main modal for wallet selection
- `WalletOption` - Individual wallet connection option
- `ConnectionStatus` - Display connected wallets
- `WalletDetection` - Show detected wallets

#### Types

- Comprehensive TypeScript interfaces for wallet types
- Support for Stellar network
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

## Configuration

### Stellar Wallets Configuration

The kit package is imported on the first wallet action. `getKit()` returns a
promise shared on the browser window, so concurrent actions and hot reload reuse
one instance. Failed downloads can be retried. Email login and logout do not
initialize the wallet kit.

```ts
const walletKit = await getKit();
walletKit.setWallet(walletId);
const { address } = await walletKit.getAddress();
```

The lightweight `kit` facade is also available. All its methods are asynchronous,
including `setWallet`; await selection before reading the address or signing.
Product IDs live in `src/lib/stellar/wallet-ids.ts` to avoid importing all adapters
for a constant. Update them alongside any wallet-kit major version upgrade.

For incremental development compilation, use `npm run dev:turbo`. The default
`npm run dev` keeps Webpack available for comparison. Production uses the existing
`npm run build` pipeline.

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

## Development Notes

### Testing

- Components are designed to work in development mode
- Stellar testnet is used by default
- Mock wallet detection for testing environments

### Dependencies

```json
{
  "@creit.tech/stellar-wallets-kit": "^1.5.0",
  "stellar-sdk": "^13.3.0",
  "react": "^18.2.0",
  "next": "^15.3.0"
}
```
