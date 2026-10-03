# Multi-Wallet Integration for SafeTrust

This directory contains a comprehensive multi-wallet integration system for the SafeTrust frontend, supporting multiple blockchain networks and wallet types.

## Features

### Supported Wallets

- **Stellar Wallets**: Freighter, Albedo, LOBSTR
- **Ethereum/BSC Wallets**: MetaMask, WalletConnect (planned)

### Key Components

#### Hooks

- `useMultiWallet()` (`hooks/multi-wallet.hook.ts`) - Drives the live login modal flow
- `useWalletOptions()` (`@/hooks/useWalletOptions`) - Lists supported wallets with live readiness state
- `useWallet()` - Legacy hook updated to work with new system

#### Components

- `MainWalletSelectionModal` - Choose a wallet family (Stellar, MetaMask, WalletConnect)
- `WalletSelectionModal` - Stellar wallet picker; shows readiness state per wallet (installed, needs permission, wrong network, web wallet, mobile-only)
- `ConnectionStatus` - Display connected wallets

Wallet availability is sourced only from `kit.getSupportedWallets()` plus `getWalletReadiness()` (`@/lib/stellar/wallet-status`) — there is no separate hand-rolled detector.

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
import { useMultiWallet } from "@/components/auth/wallet/hooks/multi-wallet.hook";
import { MainWalletSelectionModal } from "@/components/auth/wallet/components/MainWalletSelectionModal";
import { WalletSelectionModal } from "@/components/auth/wallet/components/WalletSelectionModal";

function MyComponent() {
  const {
    handleConnect,
    isMainModalOpen,
    isStellarModalOpen,
    closeMainModal,
    closeStellarModal,
    handleWalletTypeSelected,
    handleStellarWalletSelected,
  } = useMultiWallet();

  return (
    <div>
      <button onClick={handleConnect}>Login with wallet</button>

      <MainWalletSelectionModal
        isOpen={isMainModalOpen}
        onClose={closeMainModal}
        onWalletTypeSelected={handleWalletTypeSelected}
      />
      <WalletSelectionModal
        isOpen={isStellarModalOpen}
        onClose={closeStellarModal}
        onWalletSelected={handleStellarWalletSelected}
      />
    </div>
  );
}
```

This is exactly how `src/components/auth/Login.tsx` wires the login flow.

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
├── ConnectionStatus.tsx            # Connected wallets display
├── hooks/
│   ├── multi-wallet.hook.ts       # Drives the live login modal flow
│   ├── useMultiWallet.ts          # Alternate multi-wallet hook (kit's built-in modal)
│   └── wallet.hook.ts             # Enhanced legacy hook
├── components/
│   ├── MainWalletSelectionModal.tsx  # Wallet family picker
│   └── WalletSelectionModal.tsx      # Stellar wallet picker with readiness state
├── utils/
│   ├── walletConfig.ts            # Wallet configurations
│   └── walletValidation.ts        # Address validation
└── constants/
    └── wallet-kit.constant.ts     # Stellar Wallets Kit config

src/types/
└── wallet.ts                        # Shared TypeScript interfaces

src/lib/stellar/
└── wallet-status.ts                # getWalletReadiness() / listWalletsWithReadiness()

src/hooks/
└── useWalletOptions.ts             # Hook that keeps wallet readiness fresh on focus
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

`src/components/auth/Login.tsx` renders `MainWalletSelectionModal` and `WalletSelectionModal`, driven by `useMultiWallet()` from `hooks/multi-wallet.hook.ts` (see the usage example above).

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
