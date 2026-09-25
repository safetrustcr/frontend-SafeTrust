# tw-blocks (vendored)

Generated with the Trustless Work Blocks CLI (`.twblocks.json` sets `uiBase` to
`@/components/ui`). Only the blocks below are used by SafeTrust. Do not add a
block unless a page renders it in the same PR.

| Block | Used by |
|---|---|
| `escrows/multi-release/approve-milestone` | `components/hotel/CheckInApproval.tsx` |
| `escrows/multi-release/change-milestone-status` | `components/hotel/CheckOutProcess.tsx` |
| `escrows/multi-release/initialize-escrow/form` | `components/booking/EscrowCreationForm.tsx` |
| `escrows/single-release/initialize-escrow/form` | `components/booking/EscrowCreationForm.tsx` |

## Regenerating a block

Run `npx trustless-work add <block-path>`. Then remove any button, dialog, or
form variant that is not rendered by the product.

## Local modifications

- `wallet-kit/WalletProvider.tsx` falls back to SafeTrust's persisted Zustand
  wallet data and syncs it with the vendored wallet keys.
- Both `initialize-escrow/form/useInitializeEscrow.ts` hooks can resolve the
  signer from SafeTrust's persisted wallet data and normalize Soroban trustline
  addresses. The multi-release hook also adapts the receiver role and
  milestones to the multi-release API payload; the single-release hook omits
  unsupported receiver memo and trustline fields.
# Trustless Work Blocks

## Local modifications

`ReactQueryClientProvider` was removed from this directory. React Query is
provided once by `src/providers/QueryProvider.tsx`, while Trustless Work and
`EscrowProvider` are scoped through `src/providers/EscrowProviders.tsx`.

The root `AppProviders` owns the shared wallet provider. Escrow components must
not add another QueryClient or WalletProvider.
