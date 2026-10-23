# Integration Roadmap

This skeleton uses mock data so the UI can be developed independently of the production dApp. The production promotion keeps component return shapes stable while replacing the mock layer with Apollo, Hasura, and Firebase.

Status values:

- **done**: implemented in this repo and verified.
- **in progress**: partly implemented, or open as an issue or PR.
- **planned**: not started.

> **Verified against:** `src/hooks/`, `src/lib/mockData`, `src/features/apartments`, `src/features/escrow` at `ad2f38d7`. Each status below must be checked against the repo before merge.

## Mock-to-production mapping

| Skeleton | Production dApp | Status | Issue |
| --- | --- | --- | --- |
| `useApartments()` | Apollo `useQuery(GET_APARTMENTS)` | done (live Hasura adapter in `src/features/apartments`); the mock hook remains for screens not yet wired | not yet tracked |
| `useEscrowSubscription()` (mock) | Apollo `useSubscription(ESCROW_STATUS_SUBSCRIPTION)` over `graphql-ws` | planned | not yet tracked |
| `MOCK_APARTMENTS` | Hasura `public.apartments` | in progress | not yet tracked |
| `MOCK_MESSAGES` | GraphQL conversation subscription | planned | not yet tracked |
| `setTimeout` mutations | Apollo mutations | in progress (repository pattern replaces stubs; see Skeleton Architecture) | #696 |
| `mock-owner-1` | Firebase UID from the verified JWT | planned | not yet tracked |
| Escrow status webhooks | `backend-SafeTrust`: signature and timestamp validation with replay protection, persisted in `trustless_work_webhook_events` | planned (lives in backend-SafeTrust, not this repo) | not yet tracked |

## Apollo and Hasura

Install `@apollo/client`, `graphql`, and `graphql-ws` in the production dApp. Use an HTTP link for queries and mutations and a WebSocket link for subscriptions. Attach the current Firebase ID token as a Bearer token to both transports. Keep apartment queries paginated with `limit`, `offset`, and an owner filter. Return the same `data`, `loading`, and `error` shape as the mock hook.

Status: **planned**. Not yet tracked.

### Escrow subscriptions contract

Status: **planned**. This is the target contract. It is not implemented in this repo.

```graphql
subscription EscrowStatusUpdates($escrowId: uuid!) {
  escrow_transactions_by_pk(id: $escrowId) {
    id
    status
    updated_at
    transaction_hash
    escrow_transaction_users {
      id
      funding_status
      funded_at
      transaction_hash
    }
  }
}

subscription UserEscrowActivity($userId: uuid!) {
  escrow_transaction_users(
    where: { user_id: { _eq: $userId } }
    order_by: { updated_at: desc }
    limit: 20
  ) {
    id
    funding_status
    updated_at
    escrow_transaction {
      id
      status
      amount
      updated_at
    }
  }
}
```

> **Verified against:** `src/hooks/useEscrowSubscription.ts` at `ad2f38d7`. Confirm the hook's current return shape before merge. The GraphQL contract is a target, not yet verified against the Hasura schema.

## Firebase JWT flow

Status: **planned** for the Hasura side. The client Firebase login and SEP-10 session exist today (see Skeleton Architecture § Auth store).

1. The client signs in with Firebase and stores the short-lived ID token.
2. Apollo sends that token to Hasura on each request.
3. Hasura validates the JWT and maps its `sub` claim to `X-Hasura-User-Id`.
4. The `user` role may read public listings. Host writes are restricted to rows whose `owner_id` matches that claim.
5. Server-only operations verify the token with `firebase-admin`. Never expose the admin private key or log token contents.

> **Verified against:** `src/lib/firebase` and `src/hooks/useWallet.ts` at `ad2f38d7` for the client login. Hasura row permissions are not in this repo, so steps 2 to 4 are a target until the dApp schema is checked.

## Required production configuration

Status: **planned**. These variables are documented targets. Check `.env.example` before merge to confirm which ones exist.

- Client: `NEXT_PUBLIC_HASURA_GRAPHQL_URL`, `NEXT_PUBLIC_HASURA_WS_URL`, `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, and `NEXT_PUBLIC_FIREBASE_PROJECT_ID`.
- Server only: Firebase Admin credentials. These are secrets and must not appear in client code.
- Local only: `NEXT_PUBLIC_SKIP_AUTH_MIDDLEWARE=true` lets the skeleton run without auth. Production must disable it.

> **Verified against:** `.env.example` at `ad2f38d7`. Status: planned for the Hasura and admin variables. Confirm the Firebase client variables in `.env.example` before merge.

## Promotion checklist

Status: **planned**.

- [ ] Replace each mock hook with its Apollo equivalent without changing the UI contract.
- [ ] Replace delayed stub mutations with authenticated mutations and error states.
- [ ] Add loading, empty, and permission-denied states.
- [ ] Verify Hasura row permissions with guest, host, and admin users.
- [ ] Test subscriptions and token expiry against a staging project.
