import { Keypair } from "stellar-sdk";
import {
  buildDeployPayload,
  canDiscard,
  classifyTxError,
  clearIntent,
  createIntent,
  intentKey,
  isBusyState,
  loadIntent,
  loadReceipt,
  planNextAction,
  receiptKey,
  reconcile,
  recoverAfterReload,
  resolveSubmitted,
  saveIntent,
  validateEscrowSetup,
  type BookingDetails,
  type BookingEscrowIntent,
  type BookingEscrowState,
} from "../booking-escrow.machine";
import { PLATFORM_FEE_PERCENT } from "../config";
import { computeBookingPrice, countNights } from "../pricing";

const guest = Keypair.random().publicKey();
const host = Keypair.random().publicKey();
const platform = Keypair.random().publicKey();
const resolver = Keypair.random().publicKey();

beforeAll(() => {
  process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS = platform;
  process.env.NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS = resolver;
});

beforeEach(() => sessionStorage.clear());

const details = (overrides: Partial<BookingDetails> = {}): BookingDetails => ({
  listingId: "1",
  listingName: "La sabana sur",
  hostAddress: host,
  checkIn: "2030-01-10",
  checkOut: "2030-01-12",
  price: computeBookingPrice({ nightlyRate: 40.18, nights: 2, guests: 1 }),
  ...overrides,
});

const intentWith = (
  state: BookingEscrowState,
  id = "booking-1",
): BookingEscrowIntent => ({
  ...createIntent(id, details()),
  state,
});

describe("pricing", () => {
  it("adds subtotal, tax and platform fee in cents", () => {
    const p = computeBookingPrice({ nightlyRate: 40.18, nights: 2, guests: 1 });
    expect(p.subtotal).toBe(80.36);
    expect(p.tax).toBe(8.04);
    expect(p.platformFee).toBe(4.02);
    expect(p.total).toBe(92.42);
    expect(p.total).toBe(
      Math.round((p.subtotal + p.tax + p.platformFee) * 100) / 100,
    );
  });

  it("uses the configured platform fee percentage", () => {
    expect(
      computeBookingPrice({ nightlyRate: 100, nights: 1, guests: 1 })
        .platformFeePercent,
    ).toBe(PLATFORM_FEE_PERCENT);
  });

  it("reads the platform fee percentage from NEXT_PUBLIC_PLATFORM_FEE_PERCENT", () => {
    const previous = process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENT;
    process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENT = "7";
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const config = require("../config");
      expect(config.PLATFORM_FEE_PERCENT).toBe(7);
    });
    process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENT = previous;
  });

  it("accepts a zero tax rate", () => {
    const p = computeBookingPrice({
      nightlyRate: 10,
      nights: 3,
      guests: 1,
      taxRate: 0,
    });
    expect(p.tax).toBe(0);
    expect(validateEscrowSetup(details({ price: p }), guest)).toEqual([]);
  });

  it.each([NaN, -50, Infinity])(
    "clamps an invalid nightly rate (%p) to zero and blocks the escrow",
    (nightlyRate) => {
      const p = computeBookingPrice({ nightlyRate, nights: 2, guests: 1 });
      expect(p.nightlyRate).toBe(0);
      expect(p.total).toBe(0);
      expect(validateEscrowSetup(details({ price: p }), guest)).toContain(
        "The price must be greater than zero.",
      );
    },
  );

  it("counts calendar nights regardless of time of day", () => {
    expect(
      countNights(new Date(2030, 0, 10, 23, 0), new Date(2030, 0, 12, 1, 0)),
    ).toBe(2);
  });
});

describe("reconcile", () => {
  const base = { engagementId: "booking-1", amount: details().price.total };

  it("returns idle for a deploy step with no escrow on the indexer", () => {
    const r = reconcile(intentWith({ step: "deploy:awaiting-signature" }), []);
    expect(r).toEqual({ state: { step: "idle" }, escrow: null });
  });

  it("keeps a post-deploy step when the indexer has nothing yet", () => {
    const state: BookingEscrowState = { step: "deployed", contractId: "C1" };
    expect(reconcile(intentWith(state), []).state).toBe(state);
  });

  it("reports deployed when the escrow exists but is not funded", () => {
    const r = reconcile(intentWith({ step: "idle" }), [
      { ...base, contractId: "C1", balance: 0 },
    ]);
    expect(r.state).toEqual({ step: "deployed", contractId: "C1" });
  });

  it("reports funded when the balance covers the amount", () => {
    const r = reconcile(
      intentWith({
        step: "failed",
        at: "fund",
        reason: "network",
        contractId: "C1",
      }),
      [{ ...base, contractId: "C1", balance: base.amount }],
    );
    expect(r.state).toEqual({ step: "funded", contractId: "C1" });
  });

  it("ignores escrows for other engagements", () => {
    const r = reconcile(intentWith({ step: "idle" }), [
      { engagementId: "other", contractId: "C9", amount: 1, balance: 1 },
    ]);
    expect(r.escrow).toBeNull();
  });

  it("refuses to act on an escrow whose amount differs", () => {
    const r = reconcile(intentWith({ step: "idle" }), [
      { ...base, amount: base.amount + 1, contractId: "C1", balance: 0 },
    ]);
    expect(r.state).toMatchObject({
      step: "failed",
      reason: "amount-mismatch",
    });
    expect(planNextAction(r)).toBe("none");
  });
});

describe("planNextAction: the duplicate-escrow guard", () => {
  const amount = details().price.total;
  const existing = {
    engagementId: "booking-1",
    contractId: "C1",
    amount,
    balance: 0,
  };

  it("never deploys when an escrow exists for the engagementId", () => {
    for (const state of [
      { step: "idle" },
      { step: "failed", at: "deploy", reason: "network" },
      { step: "failed", at: "deploy", reason: "rejected" },
    ] as BookingEscrowState[]) {
      const r = reconcile(intentWith(state), [existing]);
      expect(planNextAction(r)).not.toBe("deploy");
    }
  });

  it("never funds when the balance already covers the amount", () => {
    const r = reconcile(intentWith({ step: "deployed", contractId: "C1" }), [
      { ...existing, balance: amount },
    ]);
    expect(planNextAction(r)).toBe("none");
  });

  it("deploys only from idle or a deploy failure with no escrow", () => {
    expect(planNextAction({ state: { step: "idle" }, escrow: null })).toBe(
      "deploy",
    );
    expect(
      planNextAction({
        state: { step: "failed", at: "deploy", reason: "rejected" },
        escrow: null,
      }),
    ).toBe("deploy");
    expect(
      planNextAction({
        state: {
          step: "failed",
          at: "fund",
          reason: "rejected",
          contractId: "C1",
        },
        escrow: null,
      }),
    ).toBe("none");
  });

  it("funds an unconfirmed contract only right after our own deploy", () => {
    const r = {
      state: { step: "deployed", contractId: "C1" } as BookingEscrowState,
      escrow: null,
    };
    expect(planNextAction(r)).toBe("none");
    expect(planNextAction(r, { justDeployed: true })).toBe("fund");
  });

  it("does nothing while a step is in flight", () => {
    const r = {
      state: {
        step: "fund:submitted",
        contractId: "C1",
        submittedAt: "x",
      } as BookingEscrowState,
      escrow: null,
    };
    expect(planNextAction(r)).toBe("none");
  });
});

describe("resolveSubmitted", () => {
  const now = Date.parse("2030-01-01T00:00:00Z");
  const fundSubmitted = {
    step: "fund:submitted" as const,
    contractId: "C1",
    submittedAt: new Date(now - 10_000).toISOString(),
  };
  const deploySubmitted = {
    step: "deploy:submitted" as const,
    submittedAt: new Date(now - 10_000).toISOString(),
  };

  it("keeps waiting while the indexer has not confirmed and the deadline is ahead", () => {
    const r = {
      state: { step: "deployed", contractId: "C1" } as BookingEscrowState,
      escrow: { engagementId: "b", contractId: "C1", balance: 0 },
    };
    expect(resolveSubmitted(fundSubmitted, r, now)).toBe(fundSubmitted);
    expect(
      resolveSubmitted(
        deploySubmitted,
        { state: { step: "idle" }, escrow: null },
        now,
      ),
    ).toBe(deploySubmitted);
  });

  it("resolves as soon as the indexer confirms", () => {
    const funded = {
      state: { step: "funded", contractId: "C1" } as BookingEscrowState,
      escrow: { engagementId: "b", contractId: "C1", balance: 5 },
    };
    expect(resolveSubmitted(fundSubmitted, funded, now)).toEqual({
      step: "funded",
      contractId: "C1",
    });
  });

  it("after the deadline, an indexer answer with a short balance stays non-fundable", () => {
    const r = {
      state: { step: "deployed", contractId: "C1" } as BookingEscrowState,
      escrow: { engagementId: "b", contractId: "C1", balance: 0 },
    };
    // The submitted tx may still land while the indexer lags, so the
    // fundable "deployed" state must never be returned past the deadline.
    expect(resolveSubmitted(fundSubmitted, r, now + 3 * 60_000)).toEqual({
      step: "failed",
      at: "fund",
      reason: "network",
      contractId: "C1",
    });
    // A failure outcome is never fundable: the retry path reconciles first.
    expect(
      planNextAction({
        ...r,
        state: {
          step: "failed",
          at: "fund",
          reason: "network",
          contractId: "C1",
        },
      }),
    ).toBe("none");
  });

  it("after the deadline with no indexer answer, reports an uncertain result", () => {
    expect(resolveSubmitted(fundSubmitted, null, now + 3 * 60_000)).toEqual({
      step: "failed",
      at: "fund",
      reason: "network",
      contractId: "C1",
    });
    expect(resolveSubmitted(deploySubmitted, null, now + 3 * 60_000)).toEqual({
      step: "failed",
      at: "deploy",
      reason: "network",
    });
  });

  it("after the deadline, keeps the submitted hash so the outcome can be probed", () => {
    const submitted = {
      step: "fund:submitted" as const,
      contractId: "C1",
      txHash: "abc",
      submittedAt: new Date(now - 10_000).toISOString(),
    };
    expect(resolveSubmitted(submitted, null, now + 3 * 60_000)).toEqual({
      step: "failed",
      at: "fund",
      reason: "network",
      contractId: "C1",
      txHash: "abc",
    });
  });
});

describe("reconcile keeps an unresolved fund non-fundable", () => {
  const unresolved = {
    step: "failed" as const,
    at: "fund" as const,
    reason: "network" as const,
    contractId: "C1",
    txHash: "abc",
  };
  const amount = intentWith({ step: "idle" }).amount;
  const existing = {
    engagementId: "booking-1",
    contractId: "C1",
    amount,
    balance: 0,
  };

  it("keeps the marker when the escrow exists with a short balance", () => {
    const r = reconcile(intentWith(unresolved), [existing], unresolved);
    expect(r.state).toEqual(unresolved);
    // Never fundable while the submitted transaction's outcome is unknown.
    expect(planNextAction(r)).toBe("none");
  });

  it("keeps the marker when the escrow exists but cannot be addressed", () => {
    const r = reconcile(
      intentWith(unresolved),
      [{ engagementId: "booking-1" }],
      unresolved,
    );
    expect(r.state).toEqual(unresolved);
  });

  it("funded still wins over the marker", () => {
    const r = reconcile(
      intentWith(unresolved),
      [{ ...existing, balance: amount }],
      unresolved,
    );
    expect(r.state).toEqual({ step: "funded", contractId: "C1" });
  });

  it("a network error before the send is not uncertain and stays retryable", () => {
    const preSubmit = {
      step: "failed" as const,
      at: "fund" as const,
      reason: "network" as const,
      contractId: "C1",
    };
    const r = reconcile(intentWith(preSubmit), [existing], preSubmit);
    expect(r.state).toEqual({ step: "deployed", contractId: "C1" });
  });

  it("a definitive failure is not preserved as unresolved", () => {
    const definitive = {
      step: "failed" as const,
      at: "fund" as const,
      reason: "insufficient-funds" as const,
      contractId: "C1",
    };
    const r = reconcile(intentWith(definitive), [existing], definitive);
    // Nothing was ever sent: the escrow is fundable again right away.
    expect(r.state).toEqual({ step: "deployed", contractId: "C1" });
  });

  it("round-trips the txHash through persistence", () => {
    saveIntent(intentWith(unresolved));
    expect(loadIntent("booking-1")?.state).toEqual(unresolved);
  });
});

describe("persistence", () => {
  it("stores one intent per booking under safetrust.escrow-intent.<bookingId>", () => {
    saveIntent(intentWith({ step: "deployed", contractId: "C1" }, "a"));
    saveIntent(intentWith({ step: "idle" }, "b"));
    expect(sessionStorage.getItem("safetrust.escrow-intent.a")).toContain("C1");
    expect(loadIntent("a")?.state).toEqual({
      step: "deployed",
      contractId: "C1",
    });
    expect(loadIntent("b")?.state).toEqual({ step: "idle" });
    clearIntent("a");
    expect(loadIntent("a")).toBeNull();
  });

  it.each([
    ["not JSON", "{oops"],
    ["wrong shape", JSON.stringify({ hello: "world" })],
    [
      "unknown step",
      JSON.stringify({
        ...intentWith({ step: "idle" }),
        state: { step: "teleported" },
      }),
    ],
    [
      "amount differs from breakdown",
      JSON.stringify({ ...intentWith({ step: "idle" }), amount: 1 }),
    ],
    [
      "engagementId differs from bookingId",
      JSON.stringify({ ...intentWith({ step: "idle" }), engagementId: "HR1" }),
    ],
    [
      "funded without contractId",
      JSON.stringify({
        ...intentWith({ step: "idle" }),
        state: { step: "funded" },
      }),
    ],
  ])("drops malformed storage (%s) without throwing", (_label, raw) => {
    sessionStorage.setItem(intentKey("booking-1"), raw);
    expect(loadIntent("booking-1")).toBeNull();
    expect(sessionStorage.getItem(intentKey("booking-1"))).toBeNull();
  });

  it("never persists wallet secrets or signed payloads", () => {
    saveIntent(
      intentWith({
        step: "fund:submitted",
        contractId: "C1",
        txHash: "abc",
        submittedAt: "2030-01-01T00:00:00Z",
      }),
    );
    const raw = sessionStorage.getItem(intentKey("booking-1")) ?? "";
    expect(raw).not.toMatch(/xdr|secret|seed|privateKey/i);
  });

  it("loads only funded receipts", () => {
    sessionStorage.setItem(
      receiptKey("booking-1"),
      JSON.stringify(intentWith({ step: "deployed", contractId: "C1" })),
    );
    expect(loadReceipt("booking-1")).toBeNull();
    sessionStorage.setItem(
      receiptKey("booking-1"),
      JSON.stringify(intentWith({ step: "funded", contractId: "C1" })),
    );
    expect(loadReceipt("booking-1")?.state).toEqual({
      step: "funded",
      contractId: "C1",
    });
  });
});

describe("state helpers", () => {
  it("marks awaiting-signature and submitted steps as busy", () => {
    expect(isBusyState({ step: "deploy:awaiting-signature" })).toBe(true);
    expect(
      isBusyState({
        step: "fund:submitted",
        contractId: "C",
        submittedAt: "x",
      }),
    ).toBe(true);
    expect(isBusyState({ step: "deployed", contractId: "C" })).toBe(false);
  });

  it("a reload turns dead wallet prompts into their pre-signature step", () => {
    expect(recoverAfterReload({ step: "deploy:awaiting-signature" })).toEqual({
      step: "idle",
    });
    expect(
      recoverAfterReload({ step: "fund:awaiting-signature", contractId: "C1" }),
    ).toEqual({
      step: "deployed",
      contractId: "C1",
    });
  });

  it("only allows starting over when no money can be in the escrow", () => {
    expect(canDiscard({ step: "deployed", contractId: "C" })).toBe(true);
    expect(
      canDiscard({
        step: "failed",
        at: "fund",
        reason: "network",
        contractId: "C",
      }),
    ).toBe(false);
    expect(canDiscard({ step: "funded", contractId: "C" })).toBe(false);
  });
});

describe("classifyTxError", () => {
  it("classifies by phase, not by message", () => {
    expect(classifyTxError("sign", new Error("network down"))).toBe("rejected");
    expect(classifyTxError("submitted", new Error("User declined"))).toBeNull();
    expect(
      classifyTxError("build", new Error("timeout of 60000ms exceeded")),
    ).toBe("network");
    expect(
      classifyTxError("build", {
        response: { data: { message: "Insufficient balance" } },
      }),
    ).toBe("insufficient-funds");
    expect(classifyTxError("build", new Error("boom"))).toBe("unknown");
  });
});

describe("validation and payload", () => {
  it("rejects a booking whose host has no wallet", () => {
    expect(validateEscrowSetup(details({ hostAddress: "" }), guest)[0]).toMatch(
      /payout wallet/,
    );
  });

  it("validates every role address with StrKey", () => {
    expect(
      validateEscrowSetup(details({ hostAddress: "GNOTAKEY" }), guest).join(),
    ).toMatch(/host/);
    expect(validateEscrowSetup(details(), "mock-owner-1").join()).toMatch(
      /Connect a Stellar wallet/,
    );

    process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS = "not-a-key";
    expect(validateEscrowSetup(details(), guest).join()).toMatch(
      /PLATFORM_WALLET_ADDRESS/,
    );
    process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS = platform;

    process.env.NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS = "";
    expect(validateEscrowSetup(details(), guest).join()).toMatch(
      /DISPUTE_RESOLVER_ADDRESS/,
    );
    process.env.NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS = resolver;
  });

  it("rejects negative tax but accepts zero", () => {
    const negative = {
      ...details().price,
      tax: -1,
      total: details().price.total - details().price.tax - 1,
    };
    expect(
      validateEscrowSetup(details({ price: negative }), guest).join(),
    ).toMatch(/Tax/);
  });

  it("builds the deploy payload from booking data only", () => {
    const intent = createIntent("3f1c-booking", details());
    const payload = buildDeployPayload(intent, guest);

    expect(payload.engagementId).toBe("3f1c-booking");
    expect(payload.amount).toBe(intent.amount);
    expect(payload.amount).toBe(details().price.total);
    expect(payload.platformFee).toBe(PLATFORM_FEE_PERCENT);
    expect(payload.title).toBe("La sabana sur: 2 nights");
    expect(payload.roles).toEqual({
      approver: guest,
      serviceProvider: host,
      platformAddress: platform,
      releaseSigner: platform,
      disputeResolver: resolver,
      receiver: host,
    });
    expect(payload.milestones).toEqual([
      { description: "Stay completed without disputes" },
    ]);
    // The legacy literals (built at runtime so `grep src` stays clean).
    const serialized = JSON.stringify(payload);
    for (const legacy of [
      ["HR1", "223423232"].join("-"),
      "GBPA2LO4" + "XHBZD54Z",
      "Shik" + "ara",
    ]) {
      expect(serialized).not.toContain(legacy);
    }
  });

  it("gives two bookings two engagementIds", () => {
    const a = buildDeployPayload(createIntent("a", details()), guest);
    const b = buildDeployPayload(createIntent("b", details()), guest);
    expect(a.engagementId).not.toBe(b.engagementId);
  });
});
