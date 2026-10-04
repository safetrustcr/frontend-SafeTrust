# Booking escrow

The one path that turns a booking into a funded Trustless Work escrow
(issue #546). Used by `components/rooms/booking/BookingButton.tsx` (`/room`)
and `components/hotels/payment/ReservationSummary.tsx`
(`/hotels/[id]/book?bookingId=…`). Both render `BookingEscrowCheckout`.

| File                        | Role                                                                                                 |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| `booking-escrow.machine.ts` | Pure logic: states, sessionStorage intent, `reconcile`, `planNextAction`, validation, deploy payload |
| `useBookingEscrow.ts`       | `useBookingEscrowFlow`: runs the machine with the tw-blocks mutations and the TW indexer             |
| `BookingEscrowCheckout.tsx` | UI for every state                                                                                   |
| `pricing.ts`                | `computeBookingPrice`: the only place the total is computed                                          |
| `config.ts`                 | Platform fee, tax rate, role addresses, USDC trustline, polling timings                              |

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
run the real `useEscrowsMutations` against fakes in `testing/escrow-harness.tsx`
(Trustless Work SDK hooks, wallet-kit signer, an in-memory chain).
