# Skeleton Architecture — frontend-SafeTrust

> For the comprehensive layer contracts, folder structure, and ESLint import boundaries, see [Architecture Contract](ARCHITECTURE.md).

Each section is labelled with its status:

- **Current**: exists in this repo today.
- **Demo**: fixtures or mock code that stands in for a real service.
- **Planned**: not built yet.

## Two-repo strategy (Current, Demo, Planned)

|                   | Current in this repo                                                                                                                                                                                                                                                                  | Demo data                                               | Planned (backend-SafeTrust / Hasura)                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Listings**      | Apartment listings read demo data from `src/features/listings/data/listings.ts`                                                                                                                                                                                                       | Additional fixtures in `src/lib/mockData`               | Hasura as the planned source for all listings                                          |
| **Escrow**        | Booking checkout deploys and funds real escrows with `@trustless-work/escrow` on Stellar. Dashboard detail pages still use the `getStubEscrow` demo fixture; no escrow subscription hook is implemented here. The network defaults to `mainnet` in production and `testnet` otherwise | No escrow subscription hook is implemented in this repo | Escrow state written only by backend-SafeTrust and read through Hasura subscriptions   |
| **Backend calls** | Some screens call the backend through `BACKEND_URL`                                                                                                                                                                                                                                   | Other screens return fixture responses                  | backend-SafeTrust as the single write authority                                        |
| **Webhooks**      | None. This repo exposes no webhook endpoints                                                                                                                                                                                                                                          | Not applicable                                          | Trustless Work webhooks deliver to backend-SafeTrust (`trustless_work_webhook_events`) |

This repo does not currently expose an escrow subscription hook. The integrated app is expected to provide live escrow updates through a Hasura subscription.

> **Verified against:** `src/features/listings`, `src/features/escrow/README.md`, `src/providers/EscrowProviders.tsx`, `package.json` at `0976ef5a`. Status: Current, Demo, Planned as labelled above.

## Data layer (Demo)

```text
src/lib/mockData/                  ← source of truth for stub data
src/features/listings/           ← listings read model; `data/listings.ts` currently supplies demo records
```

Hook contracts are feature-specific. `useListings()` returns `Listing[]` from demo data; it does not return `{ data, loading, error }`. Hooks that expose the Apollo-shaped `{ data, loading, error }` contract should retain it when their data source changes. When a component is promoted to the integrated app, update its data access and consumption to match the live hook's return contract; the JSX can stay unchanged only when that contract is preserved.

> **Verified against:** `src/lib/mockData`, `src/features/listings/hooks/useListings.ts` at `0976ef5a`. Status: Demo.

## Repository pattern (Planned)

This pattern replaces the older practice of faking mutation success with a timer. Each feature puts its data access behind a repository interface with two adapters:

- **Demo adapter.** Returns fixture data and marks its result as demo. It saves nothing, and the UI says so, for example "Demo: not saved".
- **Live adapter.** Calls the real service. It resolves only after the service confirms the write.

The UI calls the repository, never an adapter directly. It shows success only after the repository's promise resolves with confirmation. It never shows success on a timer.

Illustrative shape of the planned repository pattern (not implemented in `src/features/listings`):

```ts
export interface ListingRepository {
  createListing(input: NewListing): Promise<Listing>;
}
```

> **Verified against:** `src/features/listings/data/listings.ts` at `0976ef5a`. Status: Planned. The listings read model currently returns demo data; the two-adapter repository pattern shown above is illustrative only.

## Provider tree (Current)

```text
src/providers/
├── AuthProvider.tsx           ← auth session, mounted by route group layouts
├── QueryProvider.tsx          ← single QueryClient (+ Devtools in dev)
└── EscrowProviders.tsx        ← Trustless Work + EscrowProvider scope
```

`src/app/layout.tsx` mounts only the theme provider and toaster. Each route group layout composes the providers it needs. `EscrowProviders` is mounted by the checkout route group layout, by `RoomBookingPanel`, and by `RentBooking`. See [Architecture Contract § Route Groups](ARCHITECTURE.md#5-route-groups--runtime-profiles-fe-54).

> **Verified against:** `src/providers/`, `src/app/layout.tsx`, `src/features/escrow/README.md` at `0976ef5a`. Status: Current.

## Auth store (Current)

`src/core/store/data/index.ts` owns the single Zustand wallet store. It starts with an empty address, name, adapter ID, and token. Wallet metadata (`address`, `name`, `walletId`) is persisted under `safetrust-wallet`. Tokens, actions, identity claims, and roles are never written to or restored from that storage. The adapter ID lets xBull or LOBSTR remain the selected signer after a refresh.

`src/hooks/useWallet.ts` exposes `address`, `name`, `isConnected`, `connect`, `disconnect`, and `sign`. The wallet kit loads lazily in the browser from `src/lib/stellar/wallet-kit.ts` and survives hot reload. Its network comes from `NEXT_PUBLIC_TRUSTLESS_NETWORK` (defaulting to `mainnet` in production and `testnet` otherwise), which the escrow API and explorer configuration share. `signXdr` is the signing boundary.

Wallet metadata is a connection hint, not authorization. Login uses the server-verified SEP-10 challenge and a Firebase session. A cached address cannot redirect through login or grant dashboard access. The session listener clears expired tokens without erasing wallet metadata. Explicit logout clears both. Disconnecting a wallet clears its metadata and leaves any Firebase session in place.

> **Verified against:** `src/core/store/data/index.ts`, `src/hooks/useWallet.ts`, `src/lib/stellar/wallet-kit.ts` at `0976ef5a`. Status: Current.

## Component promotion path (Demo to live)

When a UI improvement is ready to be wired to real data:

1. Copy the component file verbatim.
2. Replace the demo data access with the live hook or repository.
3. Update the component to consume the live hook's return contract; preserve the JSX only when the contract remains compatible.
4. Replace stub submits with real mutations and confirmed results.

This is the **slice pattern**. frontend-SafeTrust is the design and UX source of truth. The integrated app is the data integration layer.

> **Verified against:** `src/features/listings`, `src/hooks` at `0976ef5a`. Status: Demo (mock data) and Planned (repository pattern).

## Dependency rules (Current)

| Package                  | Allowed | Notes                                                                                                      |
| ------------------------ | ------- | ---------------------------------------------------------------------------------------------------------- |
| `lucide-react`           | ✅       | Icons. Use this, not `react-icons`                                                                         |
| `sonner`                 | ✅       | Toast notifications                                                                                        |
| `zustand`                | ✅       | Auth store                                                                                                 |
| `date-fns`               | ✅       | Date formatting in messages                                                                                |
| `firebase`               | ✅       | Client SDK only (login and register forms)                                                                 |
| `@trustless-work/escrow` | ✅       | Used by `src/features/escrow` and `src/providers/EscrowProviders.tsx`. Mounted only where escrow is needed |
| `@apollo/client`         | ❌       | Integrated app only                                                                                        |
| `react-icons`            | ❌       | Use `lucide-react`                                                                                         |
| `@stellar/freighter-api` | ❌       | Integrated app only                                                                                        |

> **Verified against:** `package.json`, `src/features/escrow`, `src/providers/EscrowProviders.tsx` at `0976ef5a`. Status: Current.
