"use client";

/**
 * useBookingEscrowFlow: drives one booking through deploy → fund (issue #546).
 *
 * - Every transition is persisted to sessionStorage before the next await.
 * - Every action starts with `reconcile` against the Trustless Work indexer.
 * - An in-flight ref makes a second click a no-op.
 * - `*:submitted` steps poll the indexer every 5 s for up to 2 min.
 * - There is no automatic retry. The guest decides.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Networks, TransactionBuilder } from "stellar-sdk";
import {
  useGetEscrowsFromIndexerBySigner,
  useUpdateFromTxHash,
} from "@trustless-work/escrow";
import type { InitializeSingleReleaseEscrowResponse } from "@trustless-work/escrow/types";
import {
  useEscrowsMutations,
  type EscrowTxLifecycle,
} from "@/components/tw-blocks/tanstack/useEscrowsMutations";
import {
  buildDeployPayload,
  canDiscard,
  canReplaceBooking,
  classifyTxError,
  clearActiveBookingId,
  clearIntent,
  contractIdOf,
  createIntent,
  isBusyState,
  isSubmittedState,
  loadActiveBookingId,
  loadIntent,
  loadReceipt,
  newBookingId,
  planNextAction,
  recoverAfterReload,
  reconcile,
  resolveSubmitted,
  saveActiveBookingId,
  saveIntent,
  saveReceipt,
  sameBooking,
  validateEscrowSetup,
  type BookingDetails,
  type BookingEscrowIntent,
  type BookingEscrowState,
  type IndexedEscrow,
  type ReconcileResult,
  type TxPhase,
} from "./booking-escrow.machine";
import {
  STELLAR_NETWORK,
  SUBMITTED_POLL_INTERVAL_MS,
  SUBMITTED_POLL_TIMEOUT_MS,
} from "./config";

const IDLE: BookingEscrowState = { step: "idle" };

class SignatureCancelledError extends Error {
  constructor() {
    super("Signature cancelled by the guest");
    this.name = "SignatureCancelledError";
  }
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

function txHashFromXdr(signedTxXdr: string): string | undefined {
  try {
    const passphrase =
      STELLAR_NETWORK === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;
    return TransactionBuilder.fromXDR(signedTxXdr, passphrase)
      .hash()
      .toString("hex");
  } catch {
    return undefined;
  }
}

export interface UseBookingEscrowFlowOptions {
  /** A booking that already has an id (e.g. /hotels/[id]/book?bookingId=…). */
  bookingId?: string | null;
  /** Without a bookingId, the flow resumes the listing's active booking. */
  listingId?: string | null;
  guestAddress: string | null | undefined;
  onFunded?: (intent: BookingEscrowIntent) => void;
  /** Test seams. Production uses the 5 s / 2 min values from config. */
  pollIntervalMs?: number;
  pollTimeoutMs?: number;
}

export interface UseBookingEscrowFlowResult {
  intent: BookingEscrowIntent | null;
  state: BookingEscrowState;
  /** false until the persisted intent (if any) has been loaded and reconciled. */
  ready: boolean;
  isReconciling: boolean;
  /** A wallet prompt, submit, or indexer check is running. */
  inFlight: boolean;
  /** Disable every booking action. */
  isBusy: boolean;
  error: string | null;
  canDiscard: boolean;
  /** Review done: create the intent (if needed) and run the next safe step. */
  start: (booking: BookingDetails) => Promise<void>;
  /** Reconcile, then run only the missing step. */
  retry: () => Promise<void>;
  /** Reconcile, then fund. Never deploys. */
  fundNow: () => Promise<void>;
  /** Abort a pending wallet prompt. Nothing is sent afterwards. */
  cancel: () => void;
  /** Drop the booking (only when no money can be in an escrow). */
  discard: () => void;
}

export function useBookingEscrowFlow({
  bookingId: fixedBookingId = null,
  listingId = null,
  guestAddress,
  onFunded,
  pollIntervalMs = SUBMITTED_POLL_INTERVAL_MS,
  pollTimeoutMs = SUBMITTED_POLL_TIMEOUT_MS,
}: UseBookingEscrowFlowOptions): UseBookingEscrowFlowResult {
  const { deployEscrow, fundEscrow } = useEscrowsMutations();
  const { updateFromTxHash } = useUpdateFromTxHash();
  const { getEscrowsBySigner } = useGetEscrowsFromIndexerBySigner();

  const [intent, setIntent] = useState<BookingEscrowIntent | null>(null);
  const [ready, setReady] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  const [inFlight, setInFlight] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intentRef = useRef<BookingEscrowIntent | null>(null);
  const inFlightRef = useRef(false);
  const phaseRef = useRef<TxPhase | null>(null);
  const cancelRequestedRef = useRef(false);
  const mountedRef = useRef(true);
  const guestRef = useRef(guestAddress ?? null);
  const onFundedRef = useRef(onFunded);
  const pollRef = useRef({ interval: pollIntervalMs, timeout: pollTimeoutMs });

  guestRef.current = guestAddress ?? null;
  onFundedRef.current = onFunded;
  pollRef.current = { interval: pollIntervalMs, timeout: pollTimeoutMs };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // --- persistence ---------------------------------------------------------

  const commit = useCallback(
    (next: BookingEscrowIntent): BookingEscrowIntent => {
      const saved = saveIntent(next);
      intentRef.current = saved;
      if (mountedRef.current) setIntent(saved);
      return saved;
    },
    [],
  );

  const finishFunded = useCallback(
    (current: BookingEscrowIntent, contractId: string) => {
      const done: BookingEscrowIntent = {
        ...current,
        state: { step: "funded", contractId },
        updatedAt: new Date().toISOString(),
      };
      clearIntent(current.bookingId);
      saveReceipt(done);
      if (!fixedBookingId && listingId) clearActiveBookingId(listingId);
      intentRef.current = done;
      if (mountedRef.current) setIntent(done);
      onFundedRef.current?.(done);
    },
    [fixedBookingId, listingId],
  );

  /** Move the current intent to `state`, persisting it (or finishing). */
  const apply = useCallback(
    (state: BookingEscrowState): BookingEscrowIntent | null => {
      const current = intentRef.current;
      if (!current) return null;
      if (state.step === "funded") {
        finishFunded(current, state.contractId);
        return intentRef.current;
      }
      return commit({ ...current, state });
    },
    [commit, finishFunded],
  );

  const acquire = () => {
    if (inFlightRef.current) return false;
    inFlightRef.current = true;
    if (mountedRef.current) setInFlight(true);
    return true;
  };

  const release = () => {
    inFlightRef.current = false;
    phaseRef.current = null;
    if (mountedRef.current) setInFlight(false);
  };

  // --- indexer -------------------------------------------------------------

  const reconcileNow = useCallback(
    async (current: BookingEscrowIntent): Promise<ReconcileResult> => {
      const signer = current.signer ?? guestRef.current;
      if (!signer) throw new Error("No wallet to reconcile with");
      const escrows = await getEscrowsBySigner({
        signer,
        engagementId: current.engagementId,
        validateOnChain: true,
      });
      if (!Array.isArray(escrows))
        throw new Error("Indexer returned no escrows list");
      return reconcile(current, escrows as IndexedEscrow[], current.state);
    },
    [getEscrowsBySigner],
  );

  /** Poll while the current step is `*:submitted`. Caller holds the lock. */
  const settleSubmitted = useCallback(async () => {
    setIsReconciling(true);
    try {
      for (;;) {
        const current = intentRef.current;
        if (!current || !isSubmittedState(current.state) || !mountedRef.current)
          return;

        let result: ReconcileResult | null = null;
        try {
          result = await reconcileNow(current);
        } catch {
          result = null; // indexer unreachable: only the deadline ends the wait
        }
        if (!mountedRef.current) return;

        const next = resolveSubmitted(
          current.state,
          result,
          Date.now(),
          pollRef.current.timeout,
        );
        if (next !== current.state) {
          apply(next);
          if (!isSubmittedState(next)) return;
        }
        await sleep(pollRef.current.interval);
      }
    } finally {
      if (mountedRef.current) setIsReconciling(false);
    }
  }, [apply, reconcileNow]);

  /**
   * Ask the indexer for the definitive outcome of an uncertain transaction.
   * "SUCCESS" means it landed on-chain; "FAILED" means it definitively
   * failed, so a timed-out fund can safely go back to `deployed` (fundable).
   * An unreachable indexer (or a missing hash) answers "unknown": the
   * uncertainty must survive, so the failure marker is kept as-is.
   */
  const probeTxOutcome = useCallback(
    async (txHash: string): Promise<"SUCCESS" | "FAILED" | null> => {
      if (!txHash) return null;
      try {
        const response = (await updateFromTxHash({ txHash })) as {
          status?: unknown;
        } | null;
        if (response?.status === "SUCCESS" || response?.status === "FAILED")
          return response.status;
        return null;
      } catch {
        return null; // indexer unreachable: the marker must survive
      }
    },
    [updateFromTxHash],
  );

  // --- one signed transaction ----------------------------------------------

  const lifecycleFor = (
    onSubmitted: (signedTxXdr: string) => void,
  ): EscrowTxLifecycle => ({
    onAwaitingSignature: () => {
      if (cancelRequestedRef.current) throw new SignatureCancelledError();
      phaseRef.current = "sign";
    },
    beforeSubmit: () => {
      if (cancelRequestedRef.current) throw new SignatureCancelledError();
    },
    onSubmitted: (signedTxXdr) => {
      phaseRef.current = "submitted";
      onSubmitted(signedTxXdr);
    },
  });

  const failureFor = (error: unknown) => {
    const phase = phaseRef.current ?? "build";
    if (phase !== "submitted" && cancelRequestedRef.current)
      return "rejected" as const;
    return classifyTxError(phase, error);
  };

  /** Returns the contractId when the deploy is confirmed in this run. */
  const runDeploy = async (current: BookingEscrowIntent, guest: string) => {
    phaseRef.current = "build";
    cancelRequestedRef.current = false;
    const started = commit({
      ...current,
      signer: guest,
      state: { step: "deploy:awaiting-signature" },
    });

    try {
      const response = (await deployEscrow.mutateAsync({
        payload: buildDeployPayload(started, guest),
        type: "single-release",
        address: guest,
        lifecycle: lifecycleFor((xdr) =>
          apply({
            step: "deploy:submitted",
            txHash: txHashFromXdr(xdr),
            submittedAt: new Date().toISOString(),
          }),
        ),
      })) as InitializeSingleReleaseEscrowResponse;

      if (response?.contractId) {
        apply({ step: "deployed", contractId: response.contractId });
        return response.contractId;
      }
      // Sent, but the response had no contractId: let the indexer tell us.
      await settleSubmitted();
      return null;
    } catch (error) {
      const reason = failureFor(error);
      if (reason === null) {
        await settleSubmitted();
        return null;
      }
      apply({ step: "failed", at: "deploy", reason });
      return null;
    }
  };

  const runFund = async (current: BookingEscrowIntent, guest: string) => {
    const contractId = contractIdOf(current.state);
    if (!contractId) return;
    phaseRef.current = "build";
    cancelRequestedRef.current = false;
    apply({ step: "fund:awaiting-signature", contractId });

    try {
      await fundEscrow.mutateAsync({
        payload: { contractId, signer: guest, amount: current.amount },
        type: "single-release",
        address: guest,
        lifecycle: lifecycleFor((xdr) =>
          apply({
            step: "fund:submitted",
            contractId,
            txHash: txHashFromXdr(xdr),
            submittedAt: new Date().toISOString(),
          }),
        ),
      });
      apply({ step: "funded", contractId });
    } catch (error) {
      const reason = failureFor(error);
      if (reason === null) {
        await settleSubmitted();
        return;
      }
      apply({ step: "failed", at: "fund", reason, contractId });
    }
  };

  // --- the only entry point that can send transactions ----------------------

  const advance = useCallback(
    async (mode: "continue" | "fund") => {
      const guest = guestRef.current;
      const current = intentRef.current;
      if (!current) return;
      if (!guest) {
        setError("Connect a Stellar wallet to continue.");
        return;
      }
      if (current.signer && current.signer !== guest) {
        setError(
          `This booking was started with wallet ${current.signer.slice(0, 4)}…${current.signer.slice(-4)}. Reconnect that wallet to continue.`,
        );
        return;
      }
      if (!acquire()) return;
      setError(null);

      try {
        // 1. Reconcile before acting. Never trust local state alone.
        setIsReconciling(true);
        let result: ReconcileResult;
        try {
          result = await reconcileNow(current);
        } catch {
          const prev = current.state;
          const contractId = contractIdOf(prev);
          apply(
            contractId
              ? {
                  step: "failed",
                  at: "fund",
                  reason: "network",
                  contractId,
                  // An unresolved fund failure keeps its marker (and hash)
                  // so the uncertainty survives an unreachable indexer.
                  ...(prev.step === "failed" &&
                    prev.at === "fund" &&
                    prev.reason === "network" && { txHash: prev.txHash }),
                }
              : { step: "failed", at: "deploy", reason: "network" },
          );
          return;
        } finally {
          if (mountedRef.current) setIsReconciling(false);
        }

        // An unresolved fund failure (timeout with the hash kept) is only
        // resolved by a definitive outcome, never by the balance being short.
        if (
          result.state.step === "failed" &&
          result.state.at === "fund" &&
          result.state.reason === "network" &&
          result.state.txHash
        ) {
          const outcome = await probeTxOutcome(result.state.txHash);
          if (outcome === "FAILED") {
            result = {
              state: {
                step: "deployed",
                contractId: result.state.contractId!,
              },
              escrow: result.escrow,
            };
          } else if (outcome === "SUCCESS") {
            // Covered by the funded branch below when the balance follows;
            // until then the marker stands (nothing new is sent).
          }
        }

        let latest = apply(result.state);
        if (!latest || result.state.step === "funded") return;
        let action = planNextAction(result);

        if (action === "none") {
          const contractId = contractIdOf(result.state);
          if (contractId && !result.escrow && result.state.step !== "failed") {
            // We hold a contractId the indexer has not confirmed yet.
            apply({
              step: "failed",
              at: "fund",
              reason: "network",
              contractId,
            });
          }
          return;
        }

        // 2. Deploy only when reconcile proved no escrow exists.
        if (action === "deploy") {
          if (mode === "fund") return; // "Fund now" never redeploys.
          const problems = validateEscrowSetup(latest.booking, guest);
          if (problems.length > 0) {
            setError(problems[0]);
            return;
          }
          const contractId = await runDeploy(latest, guest);
          if (!contractId || !intentRef.current) return;

          // 3. Reconcile again before funding.
          latest = intentRef.current;
          try {
            result = await reconcileNow(latest);
          } catch {
            apply({
              step: "failed",
              at: "fund",
              reason: "network",
              contractId,
            });
            return;
          }
          latest = apply(result.state);
          if (!latest || result.state.step === "funded") return;
          action = planNextAction(result, { justDeployed: true });
          if (action !== "fund") return;
        }

        // 4. Fund exactly intent.amount.
        await runFund(latest, guest);
      } finally {
        release();
      }
    },
    // runDeploy/runFund only read refs and stable mutation objects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      apply,
      reconcileNow,
      probeTxOutcome,
      settleSubmitted,
      deployEscrow,
      fundEscrow,
    ],
  );

  // --- load + reconcile on mount / wallet change ------------------------------

  useEffect(() => {
    const id =
      fixedBookingId ?? (listingId ? loadActiveBookingId(listingId) : null);
    const stored = id ? loadIntent(id) : null;

    if (!stored) {
      // Only a fixed booking page shows a past receipt; the room page starts fresh.
      const receipt = id && fixedBookingId ? loadReceipt(id) : null;
      intentRef.current = receipt;
      setIntent(receipt);
      setReady(true);
      return;
    }

    const recovered = commit({
      ...stored,
      state: recoverAfterReload(stored.state),
    });
    // Render the restored step right away (e.g. "Confirming on Stellar…").
    // Actions stay disabled: the reconcile below holds the in-flight lock.
    setReady(true);
    const signer = recovered.signer ?? guestAddress;
    if (!signer || recovered.state.step === "funded") return;
    if (!acquire()) return;

    let cancelled = false;
    setIsReconciling(true);
    (async () => {
      try {
        if (isSubmittedState(recovered.state)) {
          await settleSubmitted();
        } else {
          const result = await reconcileNow(recovered);
          if (!cancelled) apply(result.state);
        }
      } catch {
        if (!cancelled) {
          setError(
            "We couldn't check this booking on Stellar. Check again in a moment.",
          );
        }
      } finally {
        release();
        if (mountedRef.current) setIsReconciling(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // guestAddress: reconcile again once a wallet connects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixedBookingId, listingId, guestAddress]);

  // --- warn before leaving mid-transaction ------------------------------------

  const state = intent?.state ?? IDLE;
  const busyState = isBusyState(state);

  useEffect(() => {
    if (!busyState) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [busyState]);

  // --- public actions ---------------------------------------------------------

  const start = useCallback(
    async (booking: BookingDetails) => {
      if (inFlightRef.current) return;
      const guest = guestRef.current;
      const problems = validateEscrowSetup(booking, guest);
      if (problems.length > 0) {
        setError(problems[0]);
        return;
      }

      let current = intentRef.current;
      if (current && current.state.step === "funded") current = null;
      if (current && !sameBooking(current.booking, booking)) {
        if (!canReplaceBooking(current.state)) {
          setError(
            "Finish or cancel the booking in progress before changing it.",
          );
          return;
        }
        // New dates or amount: new bookingId, so a late transaction for the
        // old draft can never share an engagementId with this one.
        clearIntent(current.bookingId);
        current = null;
      }

      if (!current) {
        const id = fixedBookingId ?? newBookingId();
        if (!fixedBookingId && listingId) saveActiveBookingId(listingId, id);
        commit(createIntent(id, booking));
      }

      await advance("continue");
    },
    [advance, commit, fixedBookingId, listingId],
  );

  const retry = useCallback(() => advance("continue"), [advance]);
  const fundNow = useCallback(() => advance("fund"), [advance]);

  const cancel = useCallback(() => {
    const current = intentRef.current;
    if (!current || phaseRef.current === "submitted") return;
    const { state: s } = current;
    if (s.step === "deploy:awaiting-signature") {
      cancelRequestedRef.current = true;
      apply({ step: "failed", at: "deploy", reason: "rejected" });
    } else if (s.step === "fund:awaiting-signature") {
      cancelRequestedRef.current = true;
      apply({
        step: "failed",
        at: "fund",
        reason: "rejected",
        contractId: s.contractId,
      });
    }
  }, [apply]);

  const discard = useCallback(() => {
    const current = intentRef.current;
    if (!current || inFlightRef.current || !canDiscard(current.state)) return;
    clearIntent(current.bookingId);
    if (!fixedBookingId && listingId) clearActiveBookingId(listingId);
    intentRef.current = null;
    setIntent(null);
    setError(null);
  }, [fixedBookingId, listingId]);

  return {
    intent,
    state,
    ready,
    isReconciling,
    inFlight,
    isBusy: inFlight || busyState,
    error,
    canDiscard: !!intent && !inFlight && canDiscard(state),
    start,
    retry,
    fundNow,
    cancel,
    discard,
  };
}
