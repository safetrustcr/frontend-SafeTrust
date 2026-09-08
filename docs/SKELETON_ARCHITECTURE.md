# Skeleton Architecture — frontend-SafeTrust

## Two-repo strategy

| | frontend-SafeTrust | dApp-SafeTrust |
|---|---|---|
| **Purpose** | UI skeleton | Full E2E integration |
| **Data** | Mock data | Real Hasura GraphQL |
| **Docker** | Not needed | Requires Docker + Hasura |
| **Dev port** | `localhost:3000` | `localhost:3001` |
| **Points** | 4× points (Drips Stellar Waves) | 2× points (Drips Stellar Waves) |

## Data layer

```text
src/lib/mockData/          ← source of truth for stub data
src/hooks/useApartments.ts ← mock hook (Apollo shape)
```

Every hook returns `{ data, loading, error }` matching Apollo's `useQuery` return shape. This means when a component is "promoted" to dApp-SafeTrust, the only change needed is the hook import — the JSX is identical.

## Provider stubs

```text
src/providers/
├── TrustlessWorkProvider.tsx  ← pass-through (no SDK)
├── ApolloProviderWrapper.tsx  ← pass-through (no Apollo)
├── ClientProviders.tsx        ← pass-through wrapper
└── QueryProvider.tsx          ← pass-through (no ReactQuery)
```

These exist so `layout.tsx` compiles without pulling in wallet SDK or Apollo dependencies.

## Auth store (skeleton mode)

```typescript
// src/core/store/data/index.ts
// Pre-seeded with mock values:
address:     "mock-owner-1"
token:       "mock-jwt-token"
isConnected: true
```

`disconnectWalletStore()` resets to these same values — so the user is never truly logged out in skeleton mode.

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

| Package | Allowed | Notes |
|---|---|---|
| `lucide-react` | ✅ | Icons — use this, not `react-icons` |
| `sonner` | ✅ | Toast notifications |
| `zustand` | ✅ | Auth store |
| `date-fns` | ✅ | Date formatting in messages |
| `firebase` | ✅ | Client SDK only (login/register forms) |
| `@apollo/client` | ❌ | dApp only |
| `react-icons` | ❌ | Use `lucide-react` |
| `@trustless-work/escrow` | ❌ | dApp only |
| `@stellar/freighter-api` | ❌ | dApp only |
