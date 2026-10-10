/**
 * Shared fakes for booking escrow tests.
 *
 * The real `useEscrowsMutations` runs; only the Trustless Work SDK hooks and
 * the wallet-kit signer are replaced. A tiny in-memory "chain" backs the
 * indexer so reconcile sees exactly what deploy/fund did.
 */
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Account,
  Asset,
  Keypair,
  Memo,
  Networks,
  Operation,
  TransactionBuilder,
} from "stellar-sdk";
import type { BookingDetails } from "../booking-escrow.machine";
import { computeBookingPrice } from "../pricing";

export interface FakeEscrow {
  engagementId: string;
  contractId: string;
  amount: number;
  balance: number;
}

export const chain = {
  escrows: [] as FakeEscrow[],
  nextId: 1,
  /** Called by the send fake; tests override per scenario. */
  send: async (
    _signedXdr: string,
    kind: "deploy" | "fund",
  ): Promise<unknown> => ({
    status: "SUCCESS",
    kind,
  }),
};

export const fakes = {
  deployApi: jest.fn(),
  fundApi: jest.fn(),
  sendTransaction: jest.fn(),
  signTransaction: jest.fn(),
  getEscrowsBySigner: jest.fn(),
  txStatusApi: jest.fn(),
};

/** Last payloads seen by the fakes, so tests can compare amounts. */
export const seen: {
  deploy?: Record<string, unknown>;
  fund?: Record<string, unknown>[];
} = {};

let pendingKind: "deploy" | "fund" = "deploy";
let pendingDeploy: { engagementId: string; amount: number } | null = null;
let pendingFund: { contractId: string; amount: number } | null = null;

export function landDeploy(): FakeEscrow {
  const escrow: FakeEscrow = {
    engagementId: pendingDeploy!.engagementId,
    contractId: `CCONTRACT${chain.nextId++}`,
    amount: pendingDeploy!.amount,
    balance: 0,
  };
  chain.escrows.push(escrow);
  return escrow;
}

export function landFund(): void {
  const escrow = chain.escrows.find(
    (e) => e.contractId === pendingFund!.contractId,
  );
  if (escrow) escrow.balance += pendingFund!.amount;
}

export function resetFakes() {
  chain.escrows = [];
  chain.nextId = 1;
  seen.deploy = undefined;
  seen.fund = [];
  sessionStorage.clear();
  Object.values(fakes).forEach((f) => f.mockReset());

  fakes.deployApi.mockImplementation(
    async (payload: Record<string, unknown>) => {
      seen.deploy = payload;
      pendingKind = "deploy";
      pendingDeploy = {
        engagementId: payload.engagementId as string,
        amount: payload.amount as number,
      };
      return { status: "SUCCESS", unsignedTransaction: "UNSIGNED_DEPLOY_XDR" };
    },
  );
  fakes.fundApi.mockImplementation(async (payload: Record<string, unknown>) => {
    seen.fund!.push(payload);
    pendingKind = "fund";
    pendingFund = {
      contractId: payload.contractId as string,
      amount: payload.amount as number,
    };
    return { status: "SUCCESS", unsignedTransaction: "UNSIGNED_FUND_XDR" };
  });
  fakes.signTransaction.mockImplementation((p: unknown) =>
    Promise.resolve(signedXdrFor(p as { unsignedTransaction: string })),
  );
  fakes.txStatusApi.mockResolvedValue({ status: "FAILED", message: "ok" });
  chain.send = async (_xdr, kind) => {
    if (kind === "deploy") {
      const escrow = landDeploy();
      return {
        status: "SUCCESS",
        contractId: escrow.contractId,
        message: "ok",
      };
    }
    landFund();
    return { status: "SUCCESS", message: "ok" };
  };
  fakes.sendTransaction.mockImplementation((xdr: string) =>
    chain.send(xdr, pendingKind),
  );
  fakes.getEscrowsBySigner.mockImplementation(
    async ({ engagementId }: { engagementId?: string }) =>
      chain.escrows
        .filter((e) => !engagementId || e.engagementId === engagementId)
        .map((e) => ({ ...e })),
  );
}

export const GUEST = Keypair.random().publicKey();
export const HOST = Keypair.random().publicKey();
export const PLATFORM = Keypair.random().publicKey();
export const RESOLVER = Keypair.random().publicKey();

/**
 * Real signed-XDR test transactions so `txHashFromXdr` derives a real hash:
 * the hook's uncertain-failure marker only carries a hash when one existed.
 */
function signedXdrFor({
  unsignedTransaction,
}: {
  unsignedTransaction: string;
}) {
  const signer = Keypair.random(); // test-only throwaway signer
  const tx = new TransactionBuilder(new Account(signer.publicKey(), "0"), {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: signer.publicKey(),
        asset: Asset.native(),
        amount: "0.0000001",
      }),
    )
    .addMemo(Memo.text(unsignedTransaction))
    .setTimeout(30)
    .build();
  tx.sign(signer);
  return tx.toXDR();
}

export function setEscrowEnv() {
  process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS = PLATFORM;
  process.env.NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS = RESOLVER;
}

export const makeBooking = (
  overrides: Partial<BookingDetails> = {},
): BookingDetails => ({
  listingId: "1",
  listingName: "La sabana sur",
  hostAddress: HOST,
  checkIn: "2030-01-10",
  checkOut: "2030-01-12",
  price: computeBookingPrice({ nightlyRate: 40.18, nights: 2, guests: 1 }),
  ...overrides,
});

export function QueryWrapper({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          mutations: { retry: false },
          queries: { retry: false },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

/** A promise the test resolves or rejects by hand. */
export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/**
 * Module factories for `jest.mock`. Use them lazily so the fakes above are
 * shared with the test file:
 *
 *   jest.mock("@trustless-work/escrow", () =>
 *     require("@/features/escrow/testing/escrow-harness").trustlessWorkModule());
 */
export function trustlessWorkModule() {
  const noop = () => ({});
  return {
    useInitializeEscrow: () => ({
      deployEscrow: (p: unknown) => fakes.deployApi(p),
    }),
    useFundEscrow: () => ({ fundEscrow: (p: unknown) => fakes.fundApi(p) }),
    useSendTransaction: () => ({
      sendTransaction: (x: string) => fakes.sendTransaction(x),
    }),
    useGetEscrowsFromIndexerBySigner: () => ({
      getEscrowsBySigner: (p: unknown) => fakes.getEscrowsBySigner(p),
    }),
    useUpdateFromTxHash: () => ({
      updateFromTxHash: (p: unknown) => fakes.txStatusApi(p),
    }),
    useUpdateEscrow: noop,
    useChangeMilestoneStatus: noop,
    useApproveMilestone: noop,
    useStartDispute: noop,
    useReleaseFunds: noop,
    useResolveDispute: noop,
  };
}

export function walletKitModule() {
  return {
    signTransaction: (p: unknown) => fakes.signTransaction(p),
    kit: null,
  };
}
