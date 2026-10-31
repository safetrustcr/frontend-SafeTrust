# How escrow payments work

A plain-language guide for guests and hosts. You do not need to know how
blockchain works to read it.

When you pay for a booking with escrow, SafeTrust holds the payment in an
**escrow** instead of sending it straight to the host. This page explains what
that means, what you sign, who can move the money, and what to do when
something goes wrong.

> Last reviewed: 22 October 2026. The behaviour described here matches the
> booking escrow code in this repository. Developers can read the technical
> companion, [Escrow architecture](https://github.com/safetrustcr/frontend-SafeTrust/blob/main/docs/ESCROW_ARCHITECTURE.md).

## 1. In one minute

When you pay with escrow, your payment goes into an **escrow**: a smart
contract on the Stellar network, created through Trustless Work. An escrow is
a small program with rules written into it, not a SafeTrust bank account.

- The contract holds your **whole payment**, in **USDC**, until the conditions
  in the contract are met. It is not a deposit and it is not paid to the host
  on booking.
- **Neither the host nor SafeTrust can just take the money.** The contract
  names who may approve the stay, who may release the money, and who decides a
  dispute.
- The escrow is set up to release the money to the host when the stay is
  completed without a dispute, after the approval step the contract requires.
  The release step is not in the app yet (see
  [What happens next](#5-what-happens-next)).
- **You sign twice**: once to create the escrow, once to fund it.
- **Funded is not the same as released.** A funded escrow means your USDC is
  sitting in the contract. It does not mean the host has been paid.

Two more things to keep in mind:

- The app can create and fund an escrow today. Releasing, refunding and
  disputing from the app are still being built — see
  [What happens next](#5-what-happens-next).
- On testnet, all amounts are **test USDC**. Test money has no value. See
  [Testnet notice](#7-testnet-notice).

## 2. What you pay

The checkout shows a breakdown. The bottom line, **Total held in escrow**, is
the amount written into the contract and the amount your wallet funds. The
whole total is held, not a percentage of it.

| Line on checkout            | How the app calculates it      | Notes                                                                                                                        |
| --------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Price (N nights × G guests) | nightly rate × nights × guests | The guest count is part of the calculation, so the same dates cost more for more guests.                                     |
| Taxes (10%)                 | subtotal × tax rate            | The rate is deployment configuration. 10% is the default.                                                                    |
| Platform fee (5%)           | subtotal × platform fee rate   | The rate is deployment configuration. 5% is the default. It is also declared to Trustless Work as the escrow's platform fee. |
| **Total held in escrow**    | subtotal + tax + platform fee  | This is the escrow amount — the number you see, create and fund.                                                             |

Amounts are calculated in cents, so the number on screen, the amount in the
contract and the amount funded cannot drift apart by a rounding error.

**Which currency?** The payment is in **USDC**, a US dollar stablecoin on
Stellar. The app formats amounts with a `$` sign, but the token that actually
moves on-chain is USDC. Your wallet must be able to hold USDC on the same
Stellar network the app uses.

## 3. The two signatures

Your wallet asks you to sign twice. They are two different actions:

1. **Create the escrow** (the app calls this _deploy_). The transaction creates
   the contract, sets its amount, its roles and its one milestone, "Stay
   completed without disputes". **No money moves in this step.**
2. **Fund the escrow.** This transaction moves the full total from your wallet
   into the contract. **This is the step that pays.** Until it succeeds, the
   booking is not confirmed and your money is still in your wallet.

Before each step, the app shows "Confirm in your wallet (step 1 of 2)" or
"Confirm in your wallet (step 2 of 2)".

After you sign, the app sends the transaction and shows **"Confirming on
Stellar…"**. This is not a formality: a signature only authorizes a
transaction. Stellar still has to accept it, and the app still has to see the
result. **Signing is not the same as confirmed.**

- If you close or decline the wallet prompt, nothing is sent and nothing is
  charged. You can try again when you are ready.
- If you close the page while the app is waiting for confirmation, the booking
  is kept and checked again when you come back. Do not start a second payment.
- If you are asked to sign with a different wallet than the one that started
  the booking, reconnect the original wallet. The escrow was created for that
  signer.

After the escrow is funded, the app shows **"Booking confirmed"** and links to
the contract on Stellar Expert. That link means the money is in the contract.
It does not mean it has been released to the host.

## 4. Who can do what

Every escrow has roles, fixed when the contract is created. SafeTrust fills
them from the booking and its configuration.

| Role in the escrow   | Who it is                                         | What they can do                                                                                                            |
| -------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Approver**         | You, the guest                                    | Confirms that the stay was completed. The release step cannot happen without the completion approval the contract requires. |
| **Service provider** | The host                                          | Delivers the stay and marks it complete.                                                                                    |
| **Receiver**         | The host                                          | Receives the released USDC.                                                                                                 |
| **Platform address** | SafeTrust's platform wallet                       | The platform's address in the escrow.                                                                                       |
| **Release signer**   | SafeTrust's platform wallet                       | Signs the release transaction after the stay has been approved. It cannot release before the contract's completion step.    |
| **Dispute resolver** | The dispute resolver address SafeTrust configures | Decides how the money moves if there is a dispute.                                                                          |
| **Stellar network**  | —                                                 | Records the contract and every transaction. Nobody can edit that record afterwards.                                         |

The important consequence: **the host cannot release the money alone, and
SafeTrust cannot release it without the approval the contract requires.**
The app creates the escrow with the amount shown at checkout, and the checkout
has no screen for changing it afterwards.

Your wallet keeps your keys. SafeTrust signs with its own platform wallet and
never needs your secret key or recovery phrase.

## 5. What happens next

This is the intended path of a booking:

1. **Funded.** The contract holds the total. The app shows "Booking
   confirmed". — Built today.
2. **Stay.** Nothing moves while you stay. — Built today.
3. **Completion.** The host marks the stay completed. — Coming soon.
4. **Approval.** You approve that the stay was completed. — Coming soon.
5. **Release.** SafeTrust signs the release transaction. — Coming soon.
6. **Host receives.** The USDC leaves the contract and reaches the host. —
   Coming soon.

Until these steps ship, a funded escrow simply stays funded after the stay
ends.

If something goes wrong, the intended path is a **dispute**:

1. You or the host raises a dispute. — Coming soon.
2. The dispute resolver reviews it and decides how the money moves. — Coming
   soon.
3. The money is released to the host, or refunded to you, according to that
   decision. — Coming soon.

**What the app supports today:** creating the escrow, funding it, recovering
an interrupted booking, looking up an existing escrow by its booking reference,
re-checking its status, and linking to the contract on Stellar Expert.

**What it does not support yet:** releasing funds, refunds, and opening or
deciding a dispute from the app. Those are roadmap items **IC-10**, **IC-11**
and **IC-14**; follow them in the
[SafeTrust issue tracker](https://github.com/safetrustcr/frontend-SafeTrust/issues).
A funded escrow that has not been released is expected — it does not
disappear, and it does not release itself at checkout.

### What we do not promise

- No **automatic release at check-out**. The app does not release funds when
  the stay dates end.
- No **guaranteed refund**. A refund depends on the escrow rules and, if
  needed, the dispute resolver.
- No claim that an escrow is "100% safe" or risk-free. The contract enforces
  its rules; it cannot enforce that a stay was enjoyable.

## 6. If something goes wrong

Find the message you see in the first column. Do not create a second booking
to get around a payment error: one booking has one escrow.

| You see                                                                                                                                 | It means                                                                                                                                                          | Do this                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "You cancelled the signature. Nothing was charged."                                                                                     | You closed or declined the wallet prompt. No transaction was sent.                                                                                                | Select **Try again** when you are ready.                                                                                                                                                                                                |
| "Your wallet doesn't have enough USDC (or no USDC trustline) for this payment. Nothing was charged."                                    | Your wallet has less USDC than the total, or it has no USDC trustline on this network, so it cannot hold USDC.                                                    | Add USDC and the USDC trustline for the network the app uses, then select **Try again**. See [Testnet notice](#7-testnet-notice).                                                                                                       |
| "We couldn't confirm the result."                                                                                                       | The app could not confirm the result with Stellar and the Trustless Work indexer. Your transaction may or may not have gone through.                              | **Do not pay again.** Select **Check again**. The app asks Stellar and the indexer what happened before it sends another transaction. If it still cannot confirm, contact support with your booking reference and the transaction link. |
| "This booking already has an escrow for a different amount, so we stopped before charging you. Please contact support."                 | A safety stop. An escrow with this booking reference already exists, but its amount is different from this booking. The app will not create or fund a second one. | Contact support with the booking reference. Do not start a new booking to retry.                                                                                                                                                        |
| "This host hasn't added a payout wallet yet, so this stay can't be booked with escrow. Please contact the host or choose another stay." | The listing has no Stellar wallet to receive the money. The escrow needs a receiver, so the app will not start.                                                   | Contact the host or choose another stay. The wallet is never opened and nothing is charged.                                                                                                                                             |
| "Something went wrong before anything was sent. Nothing was charged."                                                                   | An unexpected error happened before the transaction was submitted.                                                                                                | Select **Try again**.                                                                                                                                                                                                                   |
| "This booking was started with wallet 1234…abcd. Reconnect that wallet to continue."                                                    | The booking belongs to a different wallet than the one currently connected.                                                                                       | Reconnect the wallet named in the message. The escrow is tied to that signer.                                                                                                                                                           |
| Your wallet says the network is wrong                                                                                                   | Your wallet is on mainnet while the app is on testnet, or the reverse. Transactions only work on the network they are built for.                                  | Switch the wallet to the same network the app uses, then select **Try again**. The wallet prompt and the Stellar Expert link use that network.                                                                                          |

A few details behind the messages:

- **"Check again"** is the action to choose after "We couldn't confirm the
  result." It looks the escrow up on Stellar and at the Trustless Work indexer,
  with an on-chain check. The app waits up to two minutes, checking every five
  seconds, and never retries automatically.
- **"Try again"** always checks what already exists before doing anything. It
  never deploys a second escrow for the same booking and never funds one twice.
- **"Start over"** only appears when no money can be in the escrow. It is
  deliberately hidden when a payment might have gone through.
- The amount-mismatch message has **no retry button** on purpose. A different
  amount on the same booking needs a human to look at it.

## 7. Testnet notice

SafeTrust reads its Stellar network from deployment configuration, so the
network depends on the deployment you are using. The checkout and your wallet
both show which network a transaction runs on.

While the app is on **testnet**:

- Use **test USDC only**. Test USDC is not real money and has no value.
- No real payment is taken, and no real host is paid.
- Your wallet still needs a USDC trustline on testnet.
- Stellar Expert links in the app point at the testnet explorer.

A deployment configured for **mainnet** uses real USDC on the Stellar public
network. Check the network name shown in your wallet when it asks you to sign:
that is the network the transaction will run on. Never send mainnet USDC to a
testnet escrow, or test USDC to a mainnet escrow.

## 8. Glossary

| Term             | What it means here                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Wallet**       | The app that holds your Stellar keys and asks you to approve transactions. SafeTrust never sees your secret key.                                  |
| **Network**      | The Stellar blockchain the app uses. **Testnet** is a practice network with test money; **mainnet** is the public network with real money.        |
| **Signature**    | Your wallet's cryptographic approval of one specific transaction. It authorizes that transaction only.                                            |
| **Transaction**  | One action submitted to Stellar, such as "create this escrow" or "move this USDC into it".                                                        |
| **Escrow**       | A smart contract that holds the payment and enforces rules about who can release it.                                                              |
| **Funding**      | Moving the total from your wallet into the escrow contract.                                                                                       |
| **Confirmation** | Stellar has accepted the transaction and the app has seen the result. Signing alone is not confirmation.                                          |
| **Release**      | Moving the escrowed USDC out of the contract to the host after the stay is completed and approved.                                                |
| **Dispute**      | A disagreement about the stay that the dispute resolver decides.                                                                                  |
| **Trustline**    | A setting in your Stellar wallet that lets it hold a specific asset such as USDC. Without it, the wallet cannot receive or send that asset.       |
| **USDC**         | A US dollar stablecoin issued on Stellar. It is the asset this escrow holds.                                                                      |
| **Indexer**      | Trustless Work's read-only service that lists escrows and their state. It can lag Stellar slightly, which is why the app re-checks before acting. |

## 9. What we'll never ask for

SafeTrust will never ask for:

- your **secret key** (the one that starts with `S`),
- your **recovery phrase** (the 12 or 24 words),
- your wallet password,
- a signature on a transaction you have not seen and understood, or
- a "validation" of your wallet on a website someone sends you.

Your wallet should show you what a transaction does and which network it is
for. Read it before you sign. If anyone claiming to be SafeTrust asks for any
of the items above, stop and contact SafeTrust through the app's official
channels.

---

Checked on 22 October 2026 against [Trustless Work's escrow
documentation](https://docs.trustlesswork.com/trustless-work/api-rest/introduction)
and Stellar's documentation for
[networks](https://developers.stellar.org/docs/networks) and
[trustlines](https://developers.stellar.org/docs/build/guides/basics/verify-trustlines).

Developers: the roles, amounts and boundaries described here are documented in
[Escrow architecture](https://github.com/safetrustcr/frontend-SafeTrust/blob/main/docs/ESCROW_ARCHITECTURE.md). The booking state machine and
its safety rules live in
[`src/features/escrow/README.md`](https://github.com/safetrustcr/frontend-SafeTrust/blob/main/src/features/escrow/README.md).
