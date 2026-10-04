# tw-blocks (vendored)

Generated with the Trustless Work Blocks CLI (`.twblocks.json` sets `uiBase` to
`@/components/ui`). Only the blocks below are used by SafeTrust. Do not add a
block unless a page renders it in the same PR.

| Block                                           | Used by                                     |
| ----------------------------------------------- | ------------------------------------------- |
| `escrows/multi-release/approve-milestone`       | `components/hotel/CheckInApproval.tsx`      |
| `escrows/multi-release/change-milestone-status` | `components/hotel/CheckOutProcess.tsx`      |
| `escrows/multi-release/initialize-escrow/form`  | `components/booking/EscrowCreationForm.tsx` |
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
- Both `initialize-escrow/form/useInitializeEscrow.ts` hooks call `form.reset()`
  only after a successful deploy (upstream resets in `finally`, which wiped the
  guest's input when the deploy failed or the wallet signature was rejected).
- `tanstack/useEscrowsMutations.ts`: the deploy and fund mutations accept an
  optional `lifecycle` (`onAwaitingSignature`, `beforeSubmit`, `onSubmitted`).
  The booking escrow flow (`src/features/escrow`) uses it to tell "nothing was
  sent" apart from "the signed transaction may have landed", and to abort a
  cancelled signature before anything is sent. Callers that omit it behave
  exactly as upstream.
- `wallet-kit/wallet-kit.ts` re-exports the app's single `StellarWalletsKit`
  (`components/auth/wallet/constants/wallet-kit.constant.ts`) instead of
  creating a second kit pinned to Freighter, so escrow transactions are signed
  by the wallet the guest connected.
- `providers/TrustlessWork.tsx` takes a required `baseURL` prop.
  `src/providers/EscrowProviders.tsx` passes `TRUSTLESS_WORK_API_URL`, derived
  from the Stellar network rather than `NODE_ENV`, so the API always builds
  transactions for the network the wallet kit signs on.

# Trustless Work Blocks

## Local modifications

`ReactQueryClientProvider` was removed from this directory. React Query is
provided once by `src/providers/QueryProvider.tsx`, while Trustless Work and
`EscrowProvider` are scoped through `src/providers/EscrowProviders.tsx`.

The root `AppProviders` owns the shared wallet provider. Escrow components must
not add another QueryClient or WalletProvider.
