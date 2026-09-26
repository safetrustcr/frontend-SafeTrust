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

## Provider tree

```text
src/providers/
├── AppProviders.tsx           ← root client providers
├── ApolloProviderWrapper.tsx  ← single Apollo client
├── QueryProvider.tsx          ← single QueryClient (+ Devtools in dev)
└── EscrowProviders.tsx        ← Trustless Work + EscrowProvider scope
```

`layout.tsx` mounts `AppProviders` once. `EscrowProviders` is mounted only by
components that use Trustless Work escrow features, such as
`BookingEscrowWrapper` and `HotelMilestoneActions`.

## Auth store and the session cookie

The auth store holds `address`, `name` and `token`; it is deliberately not the
source of truth for *route protection*.

```text
src/lib/auth/session.ts            ← the only module that writes the session cookie
src/components/auth/FirebaseSessionSync.tsx  ← mirrors Firebase's token stream into the cookie + store
src/lib/auth/redirect.ts           ← validates the ?redirect= parameter
```

Flow:

1. `FirebaseSessionSync` is mounted once in `AppProviders`. It subscribes to
   Firebase's `onIdTokenChanged`, so sign-in, sign-out and the ~55-minute token
   refresh all run through one code path.
2. On a user it writes the ID token to the `firebase-token` cookie (60-minute
   lifetime, `sameSite=lax`, `path=/`) and stores it in the auth store. On
   `null` it removes the cookie and clears the store.
3. `middleware.ts` gates `/dashboard/*` and `/guest/*` on the cookie's presence
   only — Firebase Admin cannot run in Edge middleware, so signature
   verification stays in the server-side auth API. `Login` and `LogoutButton`
   also write/clear the cookie directly, so the first navigation after login
   and the logout path never depend on the sync component's render timing.
4. `Login` honours the `?redirect=` parameter middleware sets. Only
   same-origin absolute paths are accepted (`src/lib/auth/redirect.ts`), so the
   parameter cannot be used as an open redirect.

`NEXT_PUBLIC_SKIP_AUTH_MIDDLEWARE=true` remains the dev-only escape hatch: the
middleware short-circuits and every route is reachable without a session.
Never set it in a deployed environment.

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
