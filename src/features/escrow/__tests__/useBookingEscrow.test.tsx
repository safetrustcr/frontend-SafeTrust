/* eslint-disable @typescript-eslint/no-require-imports */
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  chain,
  fakes,
  GUEST,
  landFund,
  makeBooking,
  QueryWrapper,
  resetFakes,
  seen,
  setEscrowEnv,
  deferred,
} from "../testing/escrow-harness";
import {
  useBookingEscrowFlow,
  type UseBookingEscrowFlowOptions,
} from "../useBookingEscrow";
import {
  activeBookingKey,
  createIntent,
  intentKey,
  loadIntent,
  receiptKey,
  saveIntent,
  type BookingEscrowState,
} from "../booking-escrow.machine";

// virtual: the package's CJS entry (dist/index.cjs) is missing upstream, and
// the tests replace the whole module anyway.
jest.mock(
  "@trustless-work/escrow",
  () => require("../testing/escrow-harness").trustlessWorkModule(),
  { virtual: true },
);
jest.mock("@/components/tw-blocks/wallet-kit/wallet-kit", () =>
  require("../testing/escrow-harness").walletKitModule(),
);

const FAST = { pollIntervalMs: 10, pollTimeoutMs: 80 };

function renderFlow(options: Partial<UseBookingEscrowFlowOptions> = {}) {
  return renderHook(
    (props: Partial<UseBookingEscrowFlowOptions>) =>
      useBookingEscrowFlow({
        listingId: "1",
        guestAddress: GUEST,
        ...FAST,
        ...props,
      }),
    { wrapper: QueryWrapper, initialProps: options },
  );
}

beforeAll(setEscrowEnv);
beforeEach(() => {
  resetFakes();
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

const step = (result: { current: { state: BookingEscrowState } }) =>
  result.current.state.step;

describe("happy path", () => {
  it("deploys once, funds once, clears the intent, and keeps a receipt", async () => {
    const onFunded = jest.fn();
    const { result } = renderFlow({ onFunded });
    await waitFor(() => expect(result.current.ready).toBe(true));

    await act(() => result.current.start(makeBooking()));

    expect(step(result)).toBe("funded");
    expect(fakes.deployApi).toHaveBeenCalledTimes(1);
    expect(fakes.fundApi).toHaveBeenCalledTimes(1);
    expect(onFunded).toHaveBeenCalledTimes(1);

    const bookingId = onFunded.mock.calls[0][0].bookingId as string;
    expect(seen.deploy!.engagementId).toBe(bookingId);
    expect(sessionStorage.getItem(intentKey(bookingId))).toBeNull();
    expect(sessionStorage.getItem(activeBookingKey("1"))).toBeNull();
    expect(sessionStorage.getItem(receiptKey(bookingId))).not.toBeNull();
  });

  it("reconciles before deploying, every time", async () => {
    const { result } = renderFlow();
    await waitFor(() => expect(result.current.ready).toBe(true));
    await act(() => result.current.start(makeBooking()));

    const firstIndexerCall =
      fakes.getEscrowsBySigner.mock.invocationCallOrder[0];
    const firstDeployCall = fakes.deployApi.mock.invocationCallOrder[0];
    expect(firstIndexerCall).toBeLessThan(firstDeployCall);
    expect(fakes.getEscrowsBySigner).toHaveBeenCalledWith(
      expect.objectContaining({ signer: GUEST, validateOnChain: true }),
    );
  });
});

describe("Test 1: deploy succeeds, fund times out, retry", () => {
  it("resumes funding the existing escrow and never deploys twice", async () => {
    const { result } = renderFlow();
    await waitFor(() => expect(result.current.ready).toBe(true));

    // The fund transaction is sent, then the connection drops before the
    // response: the network never saw it land.
    let fundAttempts = 0;
    const originalSend = chain.send;
    chain.send = async (xdr, kind) => {
      if (kind === "fund" && fundAttempts++ === 0) {
        throw new Error("timeout of 60000ms exceeded");
      }
      return originalSend(xdr, kind);
    };

    await act(() => result.current.start(makeBooking()));

    // Uncertain → polled the indexer → deadline passed with the balance
    // still short: the tx outcome is unknown, so the state stays non-fundable
    // until the guest explicitly retries (which reconciles before funding).
    expect(step(result)).toBe("failed");
    expect(result.current.intent?.state).toMatchObject({
      at: "fund",
      reason: "network",
    });
    expect(fakes.deployApi).toHaveBeenCalledTimes(1);
    expect(fakes.fundApi).toHaveBeenCalledTimes(1);

    await act(() => result.current.retry());

    expect(step(result)).toBe("funded");
    expect(fakes.deployApi).toHaveBeenCalledTimes(1);
    expect(fakes.fundApi).toHaveBeenCalledTimes(2);
    expect(chain.escrows).toHaveLength(1);
  });

  it("does not fund again when the timed-out fund actually landed", async () => {
    const { result } = renderFlow();
    await waitFor(() => expect(result.current.ready).toBe(true));

    const originalSend = chain.send;
    chain.send = async (xdr, kind) => {
      if (kind === "fund") {
        landFund(); // it landed on-chain...
        throw new Error("Network Error"); // ...but the response was lost
      }
      return originalSend(xdr, kind);
    };

    await act(() => result.current.start(makeBooking()));

    expect(step(result)).toBe("funded");
    expect(fakes.fundApi).toHaveBeenCalledTimes(1);
    expect(chain.escrows[0].balance).toBe(makeBooking().price.total);
  });

  it("an uncertain deploy is resolved from the indexer, not redeployed", async () => {
    const { result } = renderFlow();
    await waitFor(() => expect(result.current.ready).toBe(true));

    const originalSend = chain.send;
    chain.send = async (xdr, kind) => {
      if (kind === "deploy") {
        await originalSend(xdr, kind); // landed
        throw new Error("socket hang up");
      }
      return originalSend(xdr, kind);
    };

    await act(() => result.current.start(makeBooking()));

    expect(step(result)).toBe("deployed");
    expect(fakes.deployApi).toHaveBeenCalledTimes(1);

    chain.send = originalSend;
    await act(() => result.current.retry());
    expect(step(result)).toBe("funded");
    expect(fakes.deployApi).toHaveBeenCalledTimes(1);
    expect(chain.escrows).toHaveLength(1);
  });
});

describe("Test 2: refresh during fund:submitted", () => {
  function persistFundSubmitted(submittedAt: string) {
    const booking = makeBooking();
    const intent = createIntent("booking-refresh", booking);
    chain.escrows.push({
      engagementId: "booking-refresh",
      contractId: "CEXISTING",
      amount: booking.price.total,
      balance: 0,
    });
    saveIntent({
      ...intent,
      signer: GUEST,
      state: {
        step: "fund:submitted",
        contractId: "CEXISTING",
        txHash: "abc",
        submittedAt,
      },
    });
    sessionStorage.setItem(activeBookingKey("1"), "booking-refresh");
    return booking;
  }

  it("recovers to funded when the indexer shows the balance", async () => {
    const booking = persistFundSubmitted(new Date().toISOString());
    chain.escrows[0].balance = booking.price.total;

    const { result } = renderFlow();

    await waitFor(() => expect(step(result)).toBe("funded"));
    expect(fakes.deployApi).not.toHaveBeenCalled();
    expect(fakes.fundApi).not.toHaveBeenCalled();
  });

  it("recovers to a failed state when the fund never landed, then the guest retries", async () => {
    persistFundSubmitted(new Date(Date.now() - 10 * 60_000).toISOString());

    const { result } = renderFlow();

    // The submitted tx's outcome is unknown: the failed state keeps the
    // submitted hash so the outcome can be probed definitively.
    await waitFor(() => expect(step(result)).toBe("failed"));
    expect(result.current.intent?.state).toEqual({
      step: "failed",
      at: "fund",
      reason: "network",
      contractId: "CEXISTING",
      txHash: "abc",
    });
    expect(fakes.deployApi).not.toHaveBeenCalled();
    expect(fakes.fundApi).not.toHaveBeenCalled();

    // "Check again": the indexer definitively reports the tx FAILED, so the
    // flow becomes fundable again — exactly one fund is sent.
    await act(() => result.current.retry());

    expect(step(result)).toBe("funded");
    expect(fakes.deployApi).not.toHaveBeenCalled();
    expect(fakes.fundApi).toHaveBeenCalledTimes(1);
  });

  it("keeps showing the submitted step while the result is unknown", async () => {
    persistFundSubmitted(new Date().toISOString());

    const { result } = renderFlow({ pollTimeoutMs: 60_000 });

    await waitFor(() => expect(fakes.getEscrowsBySigner).toHaveBeenCalled());
    expect(step(result)).toBe("fund:submitted");
    expect(result.current.isBusy).toBe(true);
  });

  it("keeps the failed marker when the tx outcome cannot be probed", async () => {
    persistFundSubmitted(new Date(Date.now() - 10 * 60_000).toISOString());
    // The indexer never answers the probe: the uncertainty must survive.
    fakes.txStatusApi.mockRejectedValue(new Error("503"));

    const { result } = renderFlow();

    await waitFor(() => expect(step(result)).toBe("failed"));
    expect(fakes.txStatusApi).not.toHaveBeenCalled();

    await act(() => result.current.retry());

    // No second fund while the original transaction's outcome is unknown.
    expect(fakes.fundApi).not.toHaveBeenCalled();
    expect(fakes.deployApi).not.toHaveBeenCalled();
    expect(result.current.intent?.state).toMatchObject({
      step: "failed",
      at: "fund",
      reason: "network",
      contractId: "CEXISTING",
      txHash: "abc",
    });
  });

  it("a reload during a wallet prompt resumes without re-deploying", async () => {
    const booking = makeBooking();
    saveIntent({
      ...createIntent("booking-prompt", booking),
      signer: GUEST,
      state: { step: "fund:awaiting-signature", contractId: "CEXISTING" },
    });
    chain.escrows.push({
      engagementId: "booking-prompt",
      contractId: "CEXISTING",
      amount: booking.price.total,
      balance: 0,
    });
    sessionStorage.setItem(activeBookingKey("1"), "booking-prompt");

    const { result } = renderFlow();

    await waitFor(() => expect(step(result)).toBe("deployed"));
    await act(() => result.current.fundNow());
    expect(step(result)).toBe("funded");
    expect(fakes.deployApi).not.toHaveBeenCalled();
  });
});

describe("Test 3: wallet rejects the deploy", () => {
  it("fails as rejected, sends nothing, keeps the booking", async () => {
    fakes.signTransaction.mockRejectedValueOnce({
      code: -4,
      message: "User declined access",
    });
    const { result } = renderFlow();
    await waitFor(() => expect(result.current.ready).toBe(true));

    await act(() => result.current.start(makeBooking()));

    expect(result.current.state).toEqual({
      step: "failed",
      at: "deploy",
      reason: "rejected",
    });
    expect(fakes.sendTransaction).not.toHaveBeenCalled();
    expect(fakes.fundApi).not.toHaveBeenCalled();
    expect(result.current.intent?.booking).toEqual(makeBooking());
    expect(loadIntent(result.current.intent!.bookingId)?.state.step).toBe(
      "failed",
    );
  });

  it("Cancel during the prompt aborts before anything is sent", async () => {
    const signature = deferred<string>();
    fakes.signTransaction.mockImplementationOnce(() => signature.promise);
    const { result } = renderFlow();
    await waitFor(() => expect(result.current.ready).toBe(true));

    let run!: Promise<void>;
    act(() => {
      run = result.current.start(makeBooking());
    });
    await waitFor(() => expect(fakes.signTransaction).toHaveBeenCalled());
    expect(step(result)).toBe("deploy:awaiting-signature");

    act(() => result.current.cancel());
    expect(result.current.state).toMatchObject({
      step: "failed",
      reason: "rejected",
    });

    // The guest signs anyway in the still-open wallet window.
    signature.resolve("SIGNED_LATE");
    await act(() => run);

    expect(fakes.sendTransaction).not.toHaveBeenCalled();
    expect(result.current.state).toMatchObject({
      step: "failed",
      reason: "rejected",
    });
  });
});

describe("Test 4: double click", () => {
  it("starts exactly one deploy", async () => {
    const indexer = deferred<unknown[]>();
    fakes.getEscrowsBySigner.mockImplementationOnce(() => indexer.promise);
    const { result } = renderFlow();
    await waitFor(() => expect(result.current.ready).toBe(true));

    let first!: Promise<void>;
    let second!: Promise<void>;
    act(() => {
      first = result.current.start(makeBooking());
      second = result.current.start(makeBooking());
    });
    indexer.resolve([]);
    await act(async () => {
      await Promise.all([first, second]);
    });

    expect(fakes.deployApi).toHaveBeenCalledTimes(1);
    expect(fakes.fundApi).toHaveBeenCalledTimes(1);
    expect(step(result)).toBe("funded");
  });
});

describe("Test 5: amount consistency", () => {
  it("deploys and funds exactly the displayed total with the configured fee", async () => {
    const booking = makeBooking();
    const { result } = renderFlow();
    await waitFor(() => expect(result.current.ready).toBe(true));

    await act(() => result.current.start(booking));

    expect(seen.deploy!.amount).toBe(booking.price.total);
    expect(seen.fund![0].amount).toBe(booking.price.total);
    expect(seen.deploy!.platformFee).toBe(booking.price.platformFeePercent);
    expect(result.current.intent!.amount).toBe(booking.price.total);
  });

  it("accepts a booking with zero tax", async () => {
    const { computeBookingPrice } = require("../pricing");
    const booking = makeBooking({
      price: computeBookingPrice({
        nightlyRate: 10,
        nights: 2,
        guests: 1,
        taxRate: 0,
      }),
    });
    const { result } = renderFlow();
    await waitFor(() => expect(result.current.ready).toBe(true));

    await act(() => result.current.start(booking));

    expect(step(result)).toBe("funded");
    expect(seen.deploy!.amount).toBe(booking.price.total);
  });
});

describe("safety guards", () => {
  it("never auto-retries after a network error", async () => {
    fakes.deployApi.mockRejectedValueOnce(
      Object.assign(new Error("Network Error"), { code: "ERR_NETWORK" }),
    );
    const { result } = renderFlow();
    await waitFor(() => expect(result.current.ready).toBe(true));

    await act(() => result.current.start(makeBooking()));
    expect(result.current.state).toEqual({
      step: "failed",
      at: "deploy",
      reason: "network",
    });

    await act(() => new Promise((r) => setTimeout(r, 200)));
    expect(fakes.deployApi).toHaveBeenCalledTimes(1);
  });

  it("does not deploy when another tab already created the escrow", async () => {
    const booking = makeBooking();
    const { result } = renderFlow({
      bookingId: "shared-booking",
      listingId: null,
    });
    await waitFor(() => expect(result.current.ready).toBe(true));
    chain.escrows.push({
      engagementId: "shared-booking",
      contractId: "COTHER",
      amount: booking.price.total,
      balance: 0,
    });

    await act(() => result.current.start(booking));

    expect(fakes.deployApi).not.toHaveBeenCalled();
    expect(seen.fund![0]).toMatchObject({
      contractId: "COTHER",
      amount: booking.price.total,
    });
    expect(step(result)).toBe("funded");
  });

  it("does nothing when the booking is already funded", async () => {
    const booking = makeBooking();
    const { result } = renderFlow({
      bookingId: "paid-booking",
      listingId: null,
    });
    await waitFor(() => expect(result.current.ready).toBe(true));
    chain.escrows.push({
      engagementId: "paid-booking",
      contractId: "CPAID",
      amount: booking.price.total,
      balance: booking.price.total,
    });

    await act(() => result.current.start(booking));

    expect(fakes.deployApi).not.toHaveBeenCalled();
    expect(fakes.fundApi).not.toHaveBeenCalled();
    expect(step(result)).toBe("funded");
  });

  it("does not deploy when the indexer cannot be reached", async () => {
    fakes.getEscrowsBySigner.mockRejectedValueOnce(new Error("503"));
    const { result } = renderFlow();
    await waitFor(() => expect(result.current.ready).toBe(true));

    await act(() => result.current.start(makeBooking()));

    expect(fakes.deployApi).not.toHaveBeenCalled();
    expect(result.current.state).toMatchObject({
      step: "failed",
      reason: "network",
    });
  });

  it("refuses to start without a host wallet and never prompts the wallet", async () => {
    const { result } = renderFlow();
    await waitFor(() => expect(result.current.ready).toBe(true));

    await act(() => result.current.start(makeBooking({ hostAddress: "" })));

    expect(result.current.error).toMatch(/payout wallet/);
    expect(result.current.intent).toBeNull();
    expect(fakes.getEscrowsBySigner).not.toHaveBeenCalled();
    expect(fakes.signTransaction).not.toHaveBeenCalled();
  });

  it("will not continue a booking with a different wallet", async () => {
    saveIntent({
      ...createIntent("booking-w", makeBooking()),
      signer: GUEST,
      state: { step: "failed", at: "deploy", reason: "rejected" },
    });
    sessionStorage.setItem(activeBookingKey("1"), "booking-w");
    const { Keypair } = require("stellar-sdk");
    const { result } = renderFlow({
      guestAddress: Keypair.random().publicKey(),
    });
    await waitFor(() => expect(result.current.ready).toBe(true));

    await act(() => result.current.retry());

    expect(result.current.error).toMatch(/Reconnect that wallet/);
    expect(fakes.deployApi).not.toHaveBeenCalled();
  });

  it("warns before leaving only while a step is in flight", async () => {
    const signature = deferred<string>();
    fakes.signTransaction.mockImplementationOnce(() => signature.promise);
    const { result } = renderFlow();
    await waitFor(() => expect(result.current.ready).toBe(true));

    const fireUnload = () => {
      const event = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    };
    expect(fireUnload()).toBe(false);

    let run!: Promise<void>;
    act(() => {
      run = result.current.start(makeBooking());
    });
    await waitFor(() => expect(step(result)).toBe("deploy:awaiting-signature"));
    expect(fireUnload()).toBe(true);

    signature.reject({ code: -4, message: "declined" });
    await act(() => run);
    expect(fireUnload()).toBe(false);
  });
});
