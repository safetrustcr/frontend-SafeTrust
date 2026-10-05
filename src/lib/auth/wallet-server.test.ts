/**
 * @jest-environment node
 */
import { getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import {
  Horizon,
  Keypair,
  Networks,
  TransactionBuilder,
  WebAuth,
} from "stellar-sdk";
import {
  hasTrustedWalletAuthOrigin,
  issueWalletChallenge,
  verifyWalletChallenge,
  WalletAuthServiceError,
} from "@/lib/auth/wallet-server";

jest.mock("firebase-admin/app", () => ({
  cert: jest.fn(),
  getApps: jest.fn(),
  initializeApp: jest.fn(),
}));
jest.mock("firebase-admin/auth", () => ({ getAuth: jest.fn() }));
jest.mock("firebase-admin/firestore", () => {
  const firestore = jest.requireActual("firebase-admin/firestore");
  return { ...firestore, getFirestore: jest.fn() };
});
jest.mock("stellar-sdk", () => {
  const stellarSdk =
    jest.requireActual<typeof import("stellar-sdk")>("stellar-sdk");
  return {
    ...stellarSdk,
    Horizon: {
      ...stellarSdk.Horizon,
      Server: jest.fn(() => ({ loadAccount: mockLoadAccount })),
    },
  };
});

const mockLoadAccount = jest.fn();
const mockCreateCustomToken = jest.fn();
const mockGetApps = jest.mocked(getApps);
const mockGetAuth = jest.mocked(getAuth);
const mockGetFirestore = jest.mocked(getFirestore);
const challenges = new Map<string, { account: string; expiresAt: Date }>();
const mockFirestore = {
  collection: jest.fn(() => ({
    doc: (id: string) => ({
      id,
      create: async (record: {
        account: string;
        expiresAt: { toDate(): Date };
      }) => {
        challenges.set(id, {
          account: record.account,
          expiresAt: record.expiresAt.toDate(),
        });
      },
      get: async () => {
        const record = challenges.get(id);
        return {
          exists: Boolean(record),
          data: () =>
            record
              ? {
                  account: record.account,
                  expiresAt: Timestamp.fromDate(record.expiresAt),
                }
              : undefined,
        };
      },
    }),
  })),
  runTransaction: async (
    callback: (transaction: {
      get: (reference: { get(): Promise<unknown> }) => Promise<unknown>;
      delete: (reference: { id: string }) => void;
    }) => Promise<unknown>,
  ) =>
    callback({
      get: (reference) => reference.get(),
      delete: (reference) => challenges.delete(reference.id),
    }),
};

describe("SEP-10 wallet authentication service", () => {
  const serverKeypair = Keypair.random();
  const clientKeypair = Keypair.random();

  beforeEach(() => {
    jest.clearAllMocks();
    challenges.clear();
    process.env.STELLAR_AUTH_SECRET = serverKeypair.secret();
    process.env.STELLAR_AUTH_HOME_DOMAIN = "safetrust.example";
    process.env.STELLAR_AUTH_WEB_AUTH_DOMAIN = "safetrust.example";
    process.env.STELLAR_NETWORK = "testnet";
    process.env.FIREBASE_ADMIN_PROJECT_ID = "safetrust-test";
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL = "firebase-admin@example.com";
    process.env.FIREBASE_ADMIN_PRIVATE_KEY = "test-private-key";
    mockGetApps.mockReturnValue([{ name: "safetrust-wallet-auth" }] as never);
    mockGetAuth.mockReturnValue({
      createCustomToken: mockCreateCustomToken,
    } as never);
    mockGetFirestore.mockReturnValue(mockFirestore as never);
    mockCreateCustomToken.mockResolvedValue("firebase-custom-token");
    mockLoadAccount.mockResolvedValue({
      thresholds: { low_threshold: 2, med_threshold: 1 },
      signers: [{ key: clientKeypair.publicKey(), weight: 1 }],
    });
  });

  it("authenticates a signed challenge and permits it to be used once", async () => {
    const challenge = await issueWalletChallenge(clientKeypair.publicKey());
    const signedTransaction = TransactionBuilder.fromXDR(
      challenge.transaction,
      Networks.TESTNET,
    );
    signedTransaction.sign(clientKeypair);
    const signedXdr = signedTransaction.toXDR();
    expect(
      WebAuth.readChallengeTx(
        signedXdr,
        serverKeypair.publicKey(),
        Networks.TESTNET,
        "safetrust.example",
        "safetrust.example",
      ).clientAccountID,
    ).toBe(clientKeypair.publicKey());

    await expect(verifyWalletChallenge(signedXdr)).resolves.toEqual({
      customToken: "firebase-custom-token",
      walletAddress: clientKeypair.publicKey(),
    });
    expect(Horizon.Server).toHaveBeenCalledWith(
      "https://horizon-testnet.stellar.org",
    );
    expect(mockCreateCustomToken).toHaveBeenCalledWith(
      expect.stringMatching(/^stellar_[0-9a-f]{64}$/),
      {
        authProvider: "stellar",
        stellarAddress: clientKeypair.publicKey(),
      },
    );
    expect(challenges.size).toBe(0);

    await expect(verifyWalletChallenge(signedXdr)).rejects.toMatchObject({
      status: 401,
    } satisfies Partial<WalletAuthServiceError>);
    expect(mockCreateCustomToken).toHaveBeenCalledTimes(1);
  });

  it("does not mint a Firebase token for an unsigned challenge", async () => {
    const challenge = await issueWalletChallenge(clientKeypair.publicKey());

    await expect(
      verifyWalletChallenge(challenge.transaction),
    ).rejects.toMatchObject({
      status: 401,
    } satisfies Partial<WalletAuthServiceError>);
    expect(mockCreateCustomToken).not.toHaveBeenCalled();
  });

  it("keeps same-origin requests valid when an optional allow-list entry is malformed", () => {
    process.env.WALLET_AUTH_ALLOWED_ORIGINS =
      "not a url, https://trusted.example";

    const request = new Request(
      "https://app.example/api/auth/wallet/challenge",
      {
        headers: { origin: "https://app.example" },
      },
    );

    expect(hasTrustedWalletAuthOrigin(request)).toBe(true);
  });

  it("accepts valid configured origins alongside malformed entries", () => {
    process.env.WALLET_AUTH_ALLOWED_ORIGINS =
      "not a url, https://trusted.example/path";

    const request = new Request(
      "https://app.example/api/auth/wallet/challenge",
      {
        headers: { origin: "https://trusted.example" },
      },
    );

    expect(hasTrustedWalletAuthOrigin(request)).toBe(true);
  });
});
