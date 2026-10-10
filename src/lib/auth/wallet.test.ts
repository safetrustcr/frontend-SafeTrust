jest.mock("@creit.tech/stellar-wallets-kit/types", () => ({
  WalletNetwork: jest.requireMock("@creit.tech/stellar-wallets-kit")
    .WalletNetwork,
}));
import { signInWithCustomToken } from "firebase/auth";
import { FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { setSessionCookie } from "@/lib/auth/session";
import { getWalletKit } from "@/lib/stellar/wallet-kit";
import { signInWithFreighter } from "@/lib/auth/wallet";

jest.mock("firebase/auth", () => ({
  signInWithCustomToken: jest.fn(),
}));
jest.mock("@creit.tech/stellar-wallets-kit", () => ({
  FREIGHTER_ID: "freighter",
}));
jest.mock("@/core/store/data", () => ({
  useGlobalAuthenticationStore: { getState: jest.fn() },
}));
jest.mock("@/lib/auth/session", () => ({
  setSessionCookie: jest.fn(),
}));
jest.mock("@/lib/stellar/wallet-kit", () => ({
  getWalletKit: jest.fn(),
}));
jest.mock("@/lib/firebase", () => ({ auth: {} }));

const mockSignInWithCustomToken = jest.mocked(signInWithCustomToken);
const mockGetWalletKit = jest.mocked(getWalletKit);
const mockSetSessionCookie = jest.mocked(setSessionCookie);
const mockStoreGetState = jest.mocked(useGlobalAuthenticationStore.getState);

describe("signInWithFreighter", () => {
  const connectWalletStore = jest.fn();
  const setToken = jest.fn();
  const getAddress = jest.fn();
  const signTransaction = jest.fn();
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock as typeof fetch;
    getAddress.mockResolvedValue({ address: "GABC" });
    signTransaction.mockResolvedValue({ signedTxXdr: "signed-xdr" });
    mockGetWalletKit.mockReturnValue({
      getSupportedWallets: jest
        .fn()
        .mockResolvedValue([
          { id: FREIGHTER_ID, name: "Freighter", isAvailable: true },
        ]),
      setWallet: jest.fn(),
      getAddress,
      signTransaction,
    } as unknown as ReturnType<typeof getWalletKit>);
    mockStoreGetState.mockReturnValue({
      connectWalletStore,
      setToken,
    } as unknown as ReturnType<typeof useGlobalAuthenticationStore.getState>);
    mockSignInWithCustomToken.mockResolvedValue({
      user: { getIdToken: jest.fn().mockResolvedValue("firebase-id-token") },
    } as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const challengeResponse = {
    transaction: "unsigned-xdr",
    network_passphrase: "Test SDF Network ; September 2015",
  };

  it("verifies the signed challenge before creating a Firebase session", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => challengeResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ customToken: "custom-token" }),
      });

    await expect(signInWithFreighter()).resolves.toBe("GABC");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/auth/wallet/challenge",
      expect.objectContaining({ body: JSON.stringify({ account: "GABC" }) }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/auth/wallet/verify",
      expect.objectContaining({
        body: JSON.stringify({ transaction: "signed-xdr" }),
      }),
    );
    expect(mockSignInWithCustomToken).toHaveBeenCalledWith({}, "custom-token");
    expect(mockSetSessionCookie).toHaveBeenCalledWith("firebase-id-token");
    expect(setToken).toHaveBeenCalledWith("firebase-id-token");
    expect(connectWalletStore).toHaveBeenCalledWith("GABC", "Freighter");
  });

  it("rejects an unavailable wallet without requesting a challenge", async () => {
    mockGetWalletKit.mockReturnValue({
      getSupportedWallets: jest
        .fn()
        .mockResolvedValue([
          { id: FREIGHTER_ID, name: "Freighter", isAvailable: false },
        ]),
    } as unknown as ReturnType<typeof getWalletKit>);

    await expect(signInWithFreighter()).rejects.toMatchObject({
      code: "NOT_INSTALLED",
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockSignInWithCustomToken).not.toHaveBeenCalled();
  });

  it("treats a rejected wallet connection as user cancellation", async () => {
    getAddress.mockRejectedValue(new Error("User rejected"));

    await expect(signInWithFreighter()).rejects.toMatchObject({
      code: "REJECTED",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("treats a rejected challenge signature as user cancellation", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => challengeResponse,
    });
    signTransaction.mockRejectedValue(new Error("User rejected"));

    await expect(signInWithFreighter()).rejects.toMatchObject({
      code: "REJECTED",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    {
      transaction: "",
      network_passphrase: challengeResponse.network_passphrase,
    },
    { transaction: challengeResponse.transaction, network_passphrase: " " },
    null,
  ])("rejects an invalid challenge response before signing", async (body) => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => body,
    });

    await expect(signInWithFreighter()).rejects.toMatchObject({
      code: "CHALLENGE_FAILED",
    });
    expect(signTransaction).not.toHaveBeenCalled();
  });

  it.each([null, {}, { customToken: " " }])(
    "rejects an invalid verification response before creating a session",
    async (body) => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => challengeResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => body,
        });

      await expect(signInWithFreighter()).rejects.toMatchObject({
        code: "CHALLENGE_FAILED",
      });
      expect(mockSignInWithCustomToken).not.toHaveBeenCalled();
    },
  );

  it("does not create a session when verification returns 401", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => challengeResponse,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({}),
      });

    await expect(signInWithFreighter()).rejects.toMatchObject({
      code: "CHALLENGE_FAILED",
    });
    expect(mockSignInWithCustomToken).not.toHaveBeenCalled();
    expect(mockSetSessionCookie).not.toHaveBeenCalled();
    expect(connectWalletStore).not.toHaveBeenCalled();
  });

  it("reports an unavailable backend for a 503 response", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({}),
    });

    await expect(signInWithFreighter()).rejects.toMatchObject({
      code: "UNAVAILABLE",
      message: "Wallet sign-in is temporarily unavailable.",
    });
    expect(mockSignInWithCustomToken).not.toHaveBeenCalled();
  });
});
