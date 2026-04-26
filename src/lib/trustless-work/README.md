# TrustlessWork SDK Integration

This directory contains the TrustlessWork SDK integration for the SafeTrust application. It provides a clean, well-organized interface for working with the TrustlessWork escrow system on the Stellar blockchain.

## 📁 Directory Structure

```
src/lib/trustless-work/
├── provider.tsx          # React provider component for SDK configuration
├── config.ts            # Configuration management and constants
├── types.ts             # TypeScript type definitions
├── hooks/               # Custom React hooks
│   ├── useEscrow.ts     # Hook for general escrow operations
│   ├── useSingleRelease.ts  # Hook for single-release escrow operations
│   ├── useMultiRelease.ts   # Hook for multi-release escrow operations
│   └── index.ts         # Hooks barrel export
├── index.ts             # Main entry point (barrel export)
└── README.md            # This file
```

## 🚀 Getting Started

### 1. Environment Setup

Add the following environment variables to your `.env` file:

```bash
# TrustlessWork Configuration
NEXT_PUBLIC_API_KEY="your_trustlesswork_api_key_here"
NEXT_PUBLIC_TRUSTLESS_API_URL=https://api.trustlesswork.com
NEXT_PUBLIC_TRUSTLESS_API_URL_DEV=https://dev.api.trustlesswork.com
NEXT_PUBLIC_TRUSTLESS_NETWORK=testnet
```

### 2. Provider Setup

Wrap your application with the `TrustlessWorkProvider`:

```tsx
// app/layout.tsx or app/providers.tsx
import { TrustlessWorkProvider } from '@/lib/trustless-work';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <TrustlessWorkProvider>
          {children}
        </TrustlessWorkProvider>
      </body>
    </html>
  );
}
```

## 📚 Usage Examples

**Important:** Due to Next.js SSR constraints, hooks must be imported from `@/lib/trustless-work/hooks`:

```tsx
// ✅ Correct - Import hooks from /hooks
import { useEscrow, useSingleRelease, useMultiRelease } from '@/lib/trustless-work/hooks';

// ✅ Correct - Import provider and types from main
import { TrustlessWorkProvider, TRUSTLESS_WORK_CONSTANTS } from '@/lib/trustless-work';
import type { EscrowData, Milestone } from '@/lib/trustless-work';
```

### Working with Domain Types (Hotel Booking)

The library provides simplified domain types (`EscrowData` and `Milestone`) for hotel booking scenarios.
These are simple TypeScript interfaces you can use directly in your components:

```tsx
import { useEscrow } from '@/lib/trustless-work/hooks';
import type { EscrowData, Milestone } from '@/lib/trustless-work';

function HotelBookingEscrow() {
  const { initialize } = useEscrow();

  const handleCreateBookingEscrow = async (
    hotelWallet: string,
    guestWallet: string,
    platformWallet: string,
    totalAmount: number
  ) => {
    // Use domain types directly - just create the data structure
    const escrowData: EscrowData = {
      contractId: '', // Will be set by SDK
      amount: totalAmount,
      currency: 'USDC',
      marker: hotelWallet,      // Hotel wallet (service provider)
      approver: guestWallet,    // Guest wallet (approver)
      releaser: platformWallet, // Platform wallet (release signer)
      resolver: platformWallet, // Platform also resolves disputes
      milestones: [
        {
          id: '1',
          description: 'Guest checks in',
          amount: totalAmount * 0.5,
          status: 'pending'
        },
        {
          id: '2',
          description: 'Guest checks out',
          amount: totalAmount * 0.5,
          status: 'pending'
        },
      ],
    };

    // When calling SDK, construct the payload directly
    const result = await initialize({
      signer: guestWallet,
      engagementId: `booking-${Date.now()}`,
      title: 'Hotel Booking Escrow',
      description: `${escrowData.currency} payment for hotel stay`,
      roles: {
        approver: escrowData.approver,
        serviceProvider: escrowData.marker,
        platformAddress: escrowData.releaser,
        releaseSigner: escrowData.releaser,
        disputeResolver: escrowData.resolver || escrowData.releaser,
        receiver: escrowData.marker,
      },
      amount: escrowData.amount,
      platformFee: totalAmount * 0.05, // 5% platform fee
      milestones: escrowData.milestones?.map(m => ({
        description: m.description,
        amount: m.amount,
      })) || [],
      trustline: { address: 'USDC_TRUSTLINE_ADDRESS' },
    }, 'multi-release');

    return result;
  };

  return (
    <button onClick={() => handleCreateBookingEscrow(
      'HOTEL_ADDR',
      'GUEST_ADDR',
      'PLATFORM_ADDR',
      1000
    )}>
      Create Booking Escrow
    </button>
  );
}
```

### General Escrow Operations

Use the `useEscrow` hook for general escrow operations:

```tsx
import { useEscrow } from '@/lib/trustless-work/hooks';

function EscrowComponent() {
  const { initialize, fund, getBySigner } = useEscrow();

  const createEscrow = async () => {
    const result = await initialize(
      {
        signer: 'signer-address',
        engagementId: 'engagement-123',
        title: 'Project Escrow',
        description: 'Escrow for development project',
        roles: {
          approver: 'approver-address',
          serviceProvider: 'provider-address',
          platformAddress: 'platform-address',
          releaseSigner: 'release-signer-address',
          disputeResolver: 'resolver-address',
          receiver: 'receiver-address',
        },
        amount: 1000,
        platformFee: 50,
        milestones: [
          { description: 'Complete design' },
          { description: 'Implement features' },
          { description: 'Testing and deployment' },
        ],
        trustline: {
          address: 'trustline-address',
        },
      },
      'single-release'
    );
    console.log('Escrow created:', result);
  };

  return <button onClick={createEscrow}>Create Escrow</button>;
}
```

### Single-Release Escrow Operations

Use the `useSingleRelease` hook for single-release escrows:

```tsx
import { useSingleRelease } from '@/lib/trustless-work/hooks';

function SingleReleaseComponent() {
  const { approveMilestone, releaseFunds } = useSingleRelease();

  const handleApprove = async () => {
    await approveMilestone({
      contractId: 'contract-id',
      milestoneIndex: '0',
      approver: 'approver-address',
    });
  };

  const handleRelease = async () => {
    await releaseFunds({
      contractId: 'contract-id',
      releaseSigner: 'release-signer-address',
    });
  };

  return (
    <div>
      <button onClick={handleApprove}>Approve Milestone</button>
      <button onClick={handleRelease}>Release All Funds</button>
    </div>
  );
}
```

### Multi-Release Escrow Operations

Use the `useMultiRelease` hook for multi-release escrows:

```tsx
import { useMultiRelease } from '@/lib/trustless-work/hooks';

function MultiReleaseComponent() {
  const { releaseFunds, getMilestoneReleaseProgress } = useMultiRelease();

  const handleReleaseMilestone = async (milestoneIndex: string) => {
    await releaseFunds({
      contractId: 'contract-id',
      milestoneIndex,
      releaseSigner: 'release-signer-address',
    });
  };

  return (
    <button onClick={() => handleReleaseMilestone('0')}>
      Release Milestone 1 Funds
    </button>
  );
}
```

## 🎯 Available Hooks

### `useEscrow()`

General escrow operations hook providing:
- `initialize()` - Create new escrows
- `fund()` - Fund an escrow
- `update()` - Update escrow details
- `getBySigner()` - Get escrows by signer address
- `getByRole()` - Get escrows by role
- `getByContractIds()` - Get escrow by contract ID
- `getBalances()` - Get multiple escrow balances
- `sendTransaction()` - Send signed transactions
- `updateFromHash()` - Update escrow from transaction hash

### `useSingleRelease()`

Single-release escrow operations hook providing:
- `approveMilestone()` - Approve a milestone
- `changeMilestoneStatus()` - Change milestone status
- `releaseFunds()` - Release all funds at once
- `startDispute()` - Start a dispute
- `resolveDispute()` - Resolve a dispute
- `withdrawRemainingFunds()` - Withdraw remaining funds

Helper functions:
- `areAllMilestonesApproved()` - Check if all milestones are approved
- `getMilestoneProgress()` - Get milestone approval progress

### `useMultiRelease()`

Multi-release escrow operations hook providing:
- `approveMilestone()` - Approve a specific milestone
- `changeMilestoneStatus()` - Change milestone status
- `releaseFunds()` - Release funds for a specific milestone
- `startDispute()` - Start a dispute for a milestone
- `resolveDispute()` - Resolve a milestone dispute
- `withdrawRemainingFunds()` - Withdraw remaining funds

Helper functions:
- `calculateTotalAmount()` - Calculate total escrow amount
- `calculateReleasedAmount()` - Calculate released amount
- `calculatePendingAmount()` - Calculate pending amount
- `getMilestoneReleaseProgress()` - Get release progress
- `isMilestoneReadyForRelease()` - Check if milestone is ready
- `getMilestonesByStatus()` - Get milestones by status

## 📖 Type Definitions

### Core Types

```typescript
// Unified escrow type
type EscrowData = SingleReleaseEscrow | MultiReleaseEscrow;

// Unified milestone type
type Milestone = SingleReleaseMilestone | MultiReleaseMilestone;

// Configuration options
interface TrustlessWorkConfigOptions {
  baseURL: string;
  apiKey: string;
  network?: 'testnet' | 'mainnet';
}
```

All SDK types are re-exported from `@trustless-work/escrow/types` for convenience.

## 🔧 Configuration

### Constants

The SDK provides useful constants:

```tsx
import { TRUSTLESS_WORK_CONSTANTS } from '@/lib/trustless-work';

// API URLs
TRUSTLESS_WORK_CONSTANTS.API_URLS.production;  // 'https://api.trustlesswork.com'
TRUSTLESS_WORK_CONSTANTS.API_URLS.development; // 'https://dev.api.trustlesswork.com'

// Escrow types
TRUSTLESS_WORK_CONSTANTS.ESCROW_TYPES.SINGLE_RELEASE;  // 'single-release'
TRUSTLESS_WORK_CONSTANTS.ESCROW_TYPES.MULTI_RELEASE;   // 'multi-release'

// Networks
TRUSTLESS_WORK_CONSTANTS.NETWORKS.TESTNET;  // 'testnet'
TRUSTLESS_WORK_CONSTANTS.NETWORKS.MAINNET;  // 'mainnet'

// Escrow statuses
TRUSTLESS_WORK_CONSTANTS.ESCROW_STATUSES.WORKING;         // 'working'
TRUSTLESS_WORK_CONSTANTS.ESCROW_STATUSES.PENDING_RELEASE; // 'pendingRelease'
TRUSTLESS_WORK_CONSTANTS.ESCROW_STATUSES.RELEASED;        // 'released'
```

## 🔐 Best Practices

1. **Environment Variables**: Always use environment variables for API keys and URLs
2. **Error Handling**: Wrap SDK calls in try-catch blocks for proper error handling
3. **Type Safety**: Use TypeScript types for better development experience
4. **Provider Placement**: Place the provider at the root level of your application
5. **Hook Usage**: Use the custom hooks (`useEscrow`, `useSingleRelease`, `useMultiRelease`) for most operations

## 📚 Additional Resources

- [TrustlessWork Official Documentation](https://docs.trustlesswork.com)
- [TrustlessWork Developer Resources](https://docs.trustlesswork.com/trustless-work/developer-resources)
- [TrustlessWork React Hooks Guide](https://docs.trustlesswork.com/trustless-work/react-library-hooks)
- [GitHub Repository](https://github.com/Trustless-Work/react-library-trustless-work)
- [NPM Package](https://www.npmjs.com/package/@trustless-work/escrow)

## 🐛 Troubleshooting

### API Key Issues
If you see warnings about missing API keys:
- Ensure `NEXT_PUBLIC_API_KEY` is set in your `.env` file
- Restart your development server after adding environment variables

### Type Errors
If you encounter TypeScript errors:
- Ensure you're importing types from `@/lib/trustless-work`
- Check that `@trustless-work/escrow` is properly installed

### Provider Issues
If hooks are not working:
- Verify `TrustlessWorkProvider` is wrapping your components
- Check the browser console for configuration errors

## 📝 License

This integration follows the same license as the SafeTrust project.
