# Trustless Work Blocks

## Local modifications

`ReactQueryClientProvider` was removed from this directory. React Query is
provided once by `src/providers/QueryProvider.tsx`, while Trustless Work and
`EscrowProvider` are scoped through `src/providers/EscrowProviders.tsx`.

The root `AppProviders` owns the shared wallet provider. Escrow components must
not add another QueryClient or WalletProvider.