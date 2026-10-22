# tw-blocks (vendored)

Generated with the Trustless Work Blocks CLI (`.twblocks.json` sets `uiBase` to
`@/components/ui`). Only the blocks below are used by SafeTrust. Do not add a
block unless a page renders it in the same PR.

| Block                                           | Used by                                     |
| ----------------------------------------------- | ------------------------------------------- |
| `escrows/multi-release/approve-milestone`       | `components/hotel/CheckInApproval.tsx`      |
| `escrows/multi-release/change-milestone-status` | `components/hotel/CheckOutProcess.tsx`      |

## Regenerating a block

Run `npx trustless-work add <block-path>`. Then remove any button, dialog, or
form variant that is not rendered by the product.

## Local modifications

- Multi-release `ApproveMilestone` and `ChangeMilestoneStatus` pass the confirmed
  `SendTransactionResponse` plus optional `customMetadata` to `onSuccess`. Their
  exported success types replace arbitrary generics and unsafe callback casts;
  callbacks run only after the mutation succeeds.

- `wallet-kit/wallet-kit.ts` adapts `signTransaction` to the canonical
  `src/lib/stellar/wallet-kit.ts` / `signXdr`. There is one lazy browser kit,
  using all supported adapters and the configured Stellar network.
- `wallet-kit/WalletProvider.tsx` reads and updates the canonical Zustand store.
  It retains the upstream context shape without separate state or storage keys.
  The old vendored `useWallet.ts` is replaced by `src/hooks/useWallet.ts`.
- `tanstack/useEscrowsMutations.ts`: the deploy and fund mutations accept an
  optional `lifecycle` (`onAwaitingSignature`, `beforeSubmit`, `onSubmitted`).
  The booking escrow flow (`src/features/escrow`) uses it to tell "nothing was
  sent" apart from "the signed transaction may have landed", and to abort a
  cancelled signature before anything is sent. Callers that omit it behave
  exactly as upstream.
- `providers/TrustlessWork.tsx` takes a required `baseURL` prop.
  `src/providers/EscrowProviders.tsx` passes `TRUSTLESS_WORK_API_URL`, derived
  from the Stellar network rather than `NODE_ENV`, so the API always builds
  transactions for the network the wallet kit signs on.

# Trustless Work Blocks

## Local modifications

`ReactQueryClientProvider` was removed from this directory. React Query is
provided once by `src/providers/QueryProvider.tsx`, while Trustless Work and
`EscrowProvider` are scoped through `src/providers/EscrowProviders.tsx`.

The root `AppProviders` owns React Query. WalletProviderScoped retains the
vendored context API on wallet/escrow routes, backed by the same Zustand store;
it does not create a second wallet store or initialize the kit.
