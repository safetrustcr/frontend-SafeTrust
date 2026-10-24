# Skeleton Architecture — frontend-SafeTrust

> For the comprehensive layer contracts, folder structure, and ESLint import boundaries, see [Architecture Contract](ARCHITECTURE.md).

## Two-repo strategy

|              | frontend-SafeTrust              | dApp-SafeTrust                  |
| ------------ | ------------------------------- | ------------------------------- |
| **Purpose**  | UI skeleton                     | Full E2E integration            |
| **Data**     | Mock data                       | Real Hasura GraphQL             |
| **Docker**   | Not needed                      | Requires Docker + Hasura        |
| **Dev port** | `localhost:3000`                | `localhost:3001`                |
| **Points**   | 4× points (Drips Stellar Waves) | 2× points (Drips Stellar Waves) |

**Webhooks:** frontend-SafeTrust exposes no webhook endpoints. Trustless Work webhooks are configured to hit `backend-SafeTrust` (`trustless_work_webhook_events`), which is the single write authority for escrow state. The UI observes changes through `useEscrowSubscription` (mock here, Hasura subscription in dApp-SafeTrust).

## Data layer

```text
src/lib/mockData/                  ← source of truth for stub data
src/features/apartments/           ← host apartments repository (demo adapter in memory, live adapter on Hasura)
src/hooks/useEscrowSubscription.ts ← mock hook ({ escrow, loading, error } shape)
```

Query hooks return `{ data, loading, error }` matching Apollo's `useQuery` return shape, while subscription hooks return resource-specific contracts like `{ escrow, loading, error }`. This means when a component is "promoted" to dApp-SafeTrust, the only change needed is the hook import — the JSX is identical.

## Provider tree

```text
src/providers/
├── AppProviders.tsx           ← root client providers
├── QueryProvider.tsx          ← single QueryClient (+ Devtools in dev)
└── EscrowProviders.tsx        ← Trustless Work + EscrowProvider scope
```

`layout.tsx` mounts `AppProviders` once. `EscrowProviders` is mounted only by
components that use Trustless Work escrow features, such as
`BookingEscrowWrapper` and `HotelMilestoneActions`.

## Auth store

`src/core/store/data/index.ts` owns the single Zustand wallet store. It starts
with an empty address, name, adapter ID, and token. Wallet metadata (`address`,
`name`, `walletId`) is persisted under `safetrust-wallet`; tokens, actions,
identity claims, and roles are never written or restored from that storage.
The adapter ID lets xBull/LOBSTR remain the selected signer after refresh.

`src/hooks/useWallet.ts` exposes `address`, `name`, `isConnected`, `connect`,
`disconnect`, and `sign`. The canonical kit is loaded lazily in the browser from
`src/lib/stellar/wallet-kit.ts` and survives hot reload. Its network comes from
`NEXT_PUBLIC_TRUSTLESS_NETWORK` (`testnet` by default), shared with escrow API
and explorer configuration. `signXdr` is the signing boundary; vendored blocks
use a compatible adapter to it and read the same store through WalletProvider.

Wallet metadata is a connection hint, not authorization. Login uses the
server-verified SEP-10 challenge and Firebase session; a cached address cannot
redirect through login or grant dashboard access. The session listener clears
expired tokens without erasing wallet metadata. Explicit logout clears both.
Disconnecting a wallet clears its metadata while retaining an independent
Firebase session.

## Mutation stubs

Replace Apollo `useMutation` with this pattern:

```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  await new Promise((r) => setTimeout(r, 600));
  console.log("(skeleton mode) Would mutate:", payload);
  toast.success("Done! (skeleton mode)");
  setLoading(false);
  router.push("/dashboard/...");
};
```

## Component promotion path

When a UI improvement in frontend-SafeTrust is ready to be wired to real data in dApp-SafeTrust:

1. Copy the component file verbatim
2. Replace the mock hook import with the Apollo hook
3. Replace the stub submit with the real mutation
4. The JSX body is unchanged

This is the **"slice" pattern** — frontend-SafeTrust is the design/UX source of truth, dApp-SafeTrust is the data integration layer.

## Dependency rules

| Package                  | Allowed | Notes                                  |
| ------------------------ | ------- | -------------------------------------- |
| `lucide-react`           | ✅      | Icons — use this, not `react-icons`    |
| `sonner`                 | ✅      | Toast notifications                    |
| `zustand`                | ✅      | Auth store                             |
| `date-fns`               | ✅      | Date formatting in messages            |
| `firebase`               | ✅      | Client SDK only (login/register forms) |
| `@apollo/client`         | ❌      | dApp only                              |
| `react-icons`            | ❌      | Use `lucide-react`                     |
| `@trustless-work/escrow` | ❌      | dApp only                              |
| `@stellar/freighter-api` | ❌      | dApp only                              |
