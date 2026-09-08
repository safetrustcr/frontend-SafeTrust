# Contributing to frontend-SafeTrust

## What this repo is

`frontend-SafeTrust` is the **UI skeleton** for SafeTrust. It runs entirely with mock/stub data — no Docker, no Hasura, no Firebase session required to develop UI components. The real data integration lives in [dApp-SafeTrust](https://github.com/safetrustcr/dApp-SafeTrust).

## Quick start

```bash
git clone https://github.com/safetrustcr/frontend-SafeTrust
cd frontend-SafeTrust
pnpm install
pnpm run dev   # → http://localhost:3000
```

No `.env` required for UI work. The app runs with hardcoded mock data out of the box.

## The golden rule

> **Do not add Apollo Client, Firebase Auth calls, or Hasura queries to this repo.**
> Every data-fetching call must use mock data from `src/lib/mockData/`.

If you need data that doesn't exist in mock data yet, add it to the appropriate mock file — do not reach for `useQuery`.

## Mock data files

| File | Exports | Description |
|---|---|---|
| `src/lib/mockData/apartments.ts` | `MOCK_APARTMENTS` | Apartment listings |
| `src/lib/mockData/hotels.ts` | `STUB_HOTELS` | Hotel listings for `/rent` |
| `src/lib/mockData/messages.ts` | `MOCK_CONVERSATIONS`, `MOCK_MESSAGES` | Conversation & message data |

## Hook abstraction pattern

Components use hooks that return `{ data, loading, error }` matching Apollo's shape — but backed by mock data:

```typescript
// ✅ Use this pattern
import { useApartments } from "@/hooks/useApartments";

const { data, loading } = useApartments({ limit: 5, offset: 0 });
```

```typescript
// ❌ Never add this to frontend-SafeTrust
import { useQuery } from "@apollo/client";

const { data } = useQuery(GET_APARTMENTS);
```

## Auth store

The global auth store is pre-seeded with mock values:

```text
address:     "mock-owner-1"
token:       "mock-jwt-token"
isConnected: true
```

No login is required to access `/dashboard` in development.

## Sidebar navigation order

```text
Escrows → Escrow Dashboard → Suggestions view → Rent →
Hotels → New Hotel → Notifications → Messages →
Favorite → Users → My apartments → New Apartment →
Interested People → [Logout]
```

## PR checklist

- [ ] No Apollo Client, Firebase Auth calls, or Hasura queries/imports added
- [ ] New data uses `src/lib/mockData/` files
- [ ] Component works in both light and dark mode
- [ ] No new `react-icons` imports (use `lucide-react` — already installed)
- [ ] Loom video showing before/after in PR description

## Branch naming

```text
feat/issue-N-short-description
fix/issue-N-short-description
refactor/issue-N-short-description
docs/issue-N-short-description
```

Always branch from `develop`, never from `main`.
