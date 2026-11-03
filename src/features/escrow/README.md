# Escrow feature

Everything about escrows lives in this module (FE-51, #589): the booking
checkout that turns a stay into a funded Trustless Work escrow (#546), the
escrow detail views, and the escrow model. A change to the escrow lifecycle
should touch only this folder.

## Public API

Code outside this folder imports only `@/features/escrow` (`index.ts`):

| Export                                                                                           | Used by                                                                  |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `BookingEscrowCheckout`                                                                          | `/room` (`BookingButton`) and `/hotels/[id]/book` (`ReservationSummary`) |
| `RentBooking`                                                                                    | `/rent/[id]/book`                                                        |
| `EscrowOverviewCard`, `EscrowContractCard`, `InvoiceHeader`, `ProcessStepper`, `EscrowPartyInfo` | `/dashboard/escrow/[id]`                                                 |
| `getStubEscrow`                                                                                  | `/dashboard/escrow/[id]` (demo fixture until the escrow API is wired)    |
| `computeBookingPrice`, `countNights`, `BookingPriceBreakdown`                                    | price breakdowns on `/room` and `/hotels/[id]/book`                      |
| `STELLAR_NETWORK`, `TRUSTLESS_WORK_API_URL`, `stellarExpertContractUrl`                          | `EscrowProviders`, `/rent/[id]/escrow/[escrowId]`                        |
| `BookingDetails` and the types in `model/types.ts`                                               | type-only imports                                                        |

Amounts are formatted with `formatEscrowAmount` from `@/lib/format`; it is a
shared formatter, not escrow state.

## Layout

| Path                              | Role                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `index.ts`                        | Public API (above)                                                                                           |
| `config.ts`                       | Platform fee, tax rate, role addresses, USDC trustline (from `lib/stellar/assets`), polling timings, API URL |
| `model/booking-escrow.machine.ts` | Pure logic: states, sessionStorage intent, `reconcile`, `planNextAction`, validation, deploy payload         |
| `model/pricing.ts`                | `computeBookingPrice`: the only place the total is computed                                                  |
| `model/types.ts`                  | Escrow types (was `src/types/escrow.ts` and `src/types/escrow-contract.ts`)                                  |
| `data/stubEscrow.ts`              | Demo escrow fixture behind `getStubEscrow`                                                                   |
| `data/claims.ts`                  | Released-escrow claims client (through the `/api/escrow-claims` proxy)                                       |
| `hooks/useBookingEscrow.ts`       | `useBookingEscrowFlow`: runs the machine with the tw-blocks mutations and the TW indexer                     |
| `components/`                     | `BookingEscrowCheckout` (UI for every state), `RentBooking`, the escrow detail cards and `views/`            |

Tests sit next to the file they cover. `usdc-config.test.tsx` covers the
configuration across the hook and the machine.

## Boundaries

- **Only this module uses the Trustless Work escrow blocks** in
  `src/components/tw-blocks/escrows`. That folder is vendored CLI output and
  stays where it is; this module wraps it.
- **The wallet stays out.** The module uses the app-wide `useWallet` and owns no
  wallet kit.
- **No write authority on the client.** Funding and release go through the
  Trustless Work API and the backend; the module only orchestrates UI state.
- Inside the module, import with relative paths (`../model/pricing`), never
  `@/features/escrow/...`.

ESLint enforces the first rule and the public API (`import/no-restricted-paths`
in `eslint.config.mjs`). `next.config.ts` lists `@/features/escrow` in
`optimizePackageImports`, so a page that imports one export does not bundle the
whole checkout.

## States

```
idle → deploy:awaiting-signature → deploy:submitted → deployed
     → fund:awaiting-signature → fund:submitted → funded
any step → failed { at: deploy | fund, reason }
```

The intent is stored under `safetrust.escrow-intent.<bookingId>` and
`engagementId === bookingId`. On `funded` the intent is cleared and a
read-only receipt (`safetrust.escrow-receipt.<bookingId>`) is kept for the
payment page.

## Rules that keep money safe

1. **Reconcile first.** Every action, and every mount with a stored intent,
   asks the indexer (`getEscrowsBySigner`, `validateOnChain: true`) what exists
   for the engagementId before doing anything.
2. **Never deploy** while the indexer shows an escrow for the engagementId.
3. **Never fund** when that escrow's balance already covers `intent.amount`, or
   when its amount differs from the intent.
4. **Errors are classified by phase, not message.** Before signing or during
   signing, nothing was sent. After the signed transaction is handed to the
   network the result is _uncertain_: the step stays `*:submitted` and the
   indexer is polled every 5 s for up to 2 min. No retry is offered meanwhile.
5. **No automatic retry.** "Try again", "Check again" and "Fund now" are the
   only ways to act again, and each one reconciles first. "Fund now" never
   deploys.
6. **One flow at a time.** An in-flight ref ignores a second click; buttons are
   disabled in `*:awaiting-signature` / `*:submitted`, and leaving the page
   warns (`beforeunload`).
7. **One amount.** `computeBookingPrice().total` is shown, deployed, funded and
   compared in reconcile. Amounts are computed in cents.
8. **One signer.** The tw-blocks wallet kit signs everything.

## Configuration

See `.env.example`: `NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS`,
`NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS`, `NEXT_PUBLIC_PLATFORM_FEE_PERCENT`,
`NEXT_PUBLIC_BOOKING_TAX_RATE`, and for the `/room` demo
`NEXT_PUBLIC_DEMO_HOST_WALLET_ADDRESS`. Missing or invalid role addresses stop
the flow before any wallet prompt.

## Tests

`npx jest src/features/escrow src/components/tw-blocks`. The integration tests
run the real `useEscrowsMutations` against fakes in
`src/test/harness/escrow.tsx` (Trustless Work SDK hooks, wallet-kit signer, an
in-memory chain).
