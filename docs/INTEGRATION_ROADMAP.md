# Integration Roadmap

This skeleton uses mock data so the UI can be developed independently of the
production dApp. The production promotion keeps component return shapes stable
while replacing the mock layer with Apollo, Hasura, and Firebase.

## Mock-to-production mapping

| Skeleton | Production dApp |
| --- | --- |
| `useApartments()` | Apollo `useQuery(GET_APARTMENTS)` |
| `MOCK_APARTMENTS` | Hasura `public.apartments` |
| `MOCK_MESSAGES` | GraphQL conversation subscription |
| `setTimeout` mutations | Apollo mutations |
| `mock-owner-1` | Firebase UID from the verified JWT |

## Apollo and Hasura

Install `@apollo/client`, `graphql`, and `graphql-ws` in the production dApp.
Use an HTTP link for queries and mutations and a WebSocket link for
subscriptions. Attach the current Firebase ID token as a Bearer token to both
transports. Keep apartment queries paginated with `limit`, `offset`, and an
owner filter; return the same `data`, `loading`, and `error` shape as the mock
hook.

## Firebase JWT flow

1. The client signs in with Firebase and stores the short-lived ID token.
2. Apollo sends that token to Hasura on each request.
3. Hasura validates the JWT and maps its `sub` claim to `X-Hasura-User-Id`.
4. The `user` role may read public listings; host writes are restricted to
   rows whose `owner_id` matches that claim.
5. Server-only operations verify the token with `firebase-admin`; never expose
   the admin private key or log token contents.

## Required production configuration

`NEXT_PUBLIC_HASURA_GRAPHQL_URL`, `NEXT_PUBLIC_HASURA_WS_URL`,
`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, and
`NEXT_PUBLIC_FIREBASE_PROJECT_ID` are client configuration. Firebase Admin
credentials are server-only secrets. The skeleton can use
`NEXT_PUBLIC_SKIP_AUTH_MIDDLEWARE=true` locally; production must disable it.

## Promotion checklist

- Replace each mock hook with its Apollo equivalent without changing the UI contract.
- Replace delayed stub mutations with authenticated mutations and error states.
- Add loading, empty, and permission-denied states.
- Verify Hasura row permissions with guest, host, and admin users.
- Test subscriptions and token expiry against a staging project.
