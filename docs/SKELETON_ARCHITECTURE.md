# Skeleton Architecture — frontend-SafeTrust

> For the comprehensive layer contracts, folder structure, and ESLint import boundaries, see [Architecture Contract](ARCHITECTURE.md).

Each section is labelled with its status:

- **Current**: exists in this repo today.
- **Demo**: fixtures or mock code that stands in for a real service.
- **Planned**: not built yet.

## Two-repo strategy (Current, Demo, Planned)

| | Current in this repo | Demo data | Planned (backend-SafeTrust / Hasura) |
| --- | --- | --- | --- |
| **Listings** | Apartment listings use a live Hasura adapter in `src/features/apartments` | Fixture listings in `src/lib/mockData` for screens not yet wired | Hasura as the source for all listings |
| **Escrow** | Booking checkout deploys and funds real escrows with `@trustless-work/escrow` on Stellar. The network comes from `NEXT_PUBLIC_TRUSTLESS_NETWORK`, which defaults to `testnet` | Demo flows read escrow status through `useEscrowSubscription` | Escrow state written only by backend-SafeTrust and read through Hasura subscriptions |
| **Backend calls** | Some screens call the backend through `BACKEND_URL` | Other screens return fixture responses | backend-SafeTrust as the single write authority |
| **Webhooks** | None. This repo exposes no webhook endpoints | Not applicable | Trustless Work webhooks deliver to backend-SafeTrust (`trustless_work_webhook_events`) |

The UI observes escrow changes through `useEscrowSubscription`. It is a mock in this repo and a Hasura subscription in the integrated app. Only the hook changes when a component is promoted.

> **Verified against:** `src/features/apartments`, `src/features/escrow/README.md`, `src/providers/EscrowProviders.tsx`, `package.json` at `ad2f38d7`. Status: Current, Demo, Planned as labelled above.

## Data layer (Demo)

```text
src/lib/mockData/                  ← source of truth for stub data
src/hooks/useApartments.ts         ← mock hook (Apollo { data, loading, error } shape)
src/hooks/useEscrowSubscription.ts ← mock hook ({ escrow, loading, error } shape)
```

Query hooks return `{ data, loading, error }`, matching Apollo's `useQuery` return shape. Subscription hooks return resource-specific contracts such as `{ escrow, loading, error }`. When a component is promoted to the integrated app, only the hook import changes. The JSX stays the same.

> **Verified against:** `src/lib/mockData`, `src/hooks/useApartments.ts`, `src/hooks/useEscrowSubscription.ts` at `ad2f38d7`. Status: Demo.

## Repository pattern (Current)

This pattern replaces the older practice of faking mutation success with a timer. Each feature puts its data access behind a repository interface with two adapters:

- **Demo adapter.** Returns fixture data and marks its result as demo. It saves nothing, and the UI says so, for example "Demo: not saved".
- **Live adapter.** Calls the real service. It resolves only after the service confirms the write.

The UI calls the repository, never an adapter directly. It shows success only after the repository's promise resolves with confirmation. It never shows success on a timer.

Illustrative shape. The real code is in `src/features/apartments`:

```ts
export interface ListingRepository {
  createListing(input: NewListing): Promise<Listing>;
}
```

> **Verified against:** `src/features/apartments` at `ad2f38d7`. Status: Current. Live adapter present, example feature.

## Provider tree (Current)

```text
src/providers/
├── AppProviders.tsx           ← root client providers
├── QueryProvider.tsx          ← single QueryClient (+ Devtools in dev)
└── EscrowProviders.tsx        ← Trustless Work + EscrowProvider scope
```

`src/app/layout.tsx` mounts `AppProviders` once. `EscrowProviders` is mounted only by components that use Trustless Work escrow features, such as `BookingEscrowWrapper` and `HotelMilestoneActions`. Composing providers per route group is **Planned**. See [Architecture Contract § Route Groups](ARCHITECTURE.md#5-route-groups--runtime-profiles-fe-54).

> **Verified against:** `src/providers/`, `src/app/layout.tsx`, `src/features/escrow/README.md` at `ad2f38d7`. Status: Current; per-route-group composition is Planned.

## Auth store (Current)

`src/core/store/data/index.ts` owns the single Zustand wallet store. It starts with an empty address, name, adapter ID, and token. Wallet metadata (`address`, `name`, `walletId`) is persisted under `safetrust-wallet`. Tokens, actions, identity claims, and roles are never written to or restored from that storage. The adapter ID lets xBull or LOBSTR remain the selected signer after a refresh.

`src/hooks/useWallet.ts` exposes `address`, `name`, `isConnected`, `connect`, `disconnect`, and `sign`. The wallet kit loads lazily in the browser from `src/lib/stellar/wallet-kit.ts` and survives hot reload. Its network comes from `NEXT_PUBLIC_TRUSTLESS_NETWORK` (`testnet` by default), which the escrow API and explorer configuration share. `signXdr` is the signing boundary.

Wallet metadata is a connection hint, not authorization. Login uses the server-verified SEP-10 challenge and a Firebase session. A cached address cannot redirect through login or grant dashboard access. The session listener clears expired tokens without erasing wallet metadata. Explicit logout clears both. Disconnecting a wallet clears its metadata and leaves any Firebase session in place.

> **Verified against:** `src/core/store/data/index.ts`, `src/hooks/useWallet.ts`, `src/lib/stellar/wallet-kit.ts` at `ad2f38d7`. Status: Current.

## Component promotion path (Demo to live)

When a UI improvement is ready to be wired to real data:

1. Copy the component file verbatim.
2. Replace the mock hook import with the live hook or Apollo hook.
3. Replace the demo adapter with the live adapter, or the stub submit with the real mutation.
4. The JSX body does not change.

This is the **slice pattern**. frontend-SafeTrust is the design and UX source of truth. The integrated app is the data integration layer.

> **Verified against:** `src/features/apartments`, `src/hooks` at `ad2f38d7`. Status: Demo (mock hooks) and Current (repository pattern).

## Dependency rules (Current)

| Package | Allowed | Notes |
| --- | --- | --- |
| `lucide-react` | ✅ | Icons. Use this, not `react-icons` |
| `sonner` | ✅ | Toast notifications |
| `zustand` | ✅ | Auth store |
| `date-fns` | ✅ | Date formatting in messages |
| `firebase` | ✅ | Client SDK only (login and register forms) |
| `@trustless-work/escrow` | ✅ | Used by `src/features/escrow` and `src/providers/EscrowProviders.tsx`. Mounted only where escrow is needed |
| `@apollo/client` | ❌ | Integrated app only |
| `react-icons` | ❌ | Use `lucide-react` |
| `@stellar/freighter-api` | ❌ | Integrated app only |

> **Verified against:** `package.json`, `src/features/escrow`, `src/providers/EscrowProviders.tsx` at `ad2f38d7`. Status: Current.
