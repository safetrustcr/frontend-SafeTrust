/**
 * @jest-environment node
 */
import {
  GET as walletGET,
  POST as walletPOST,
  OPTIONS as walletOPTIONS,
} from "./route";
import { POST as challengePOST } from "./challenge/route";
import { POST as verifyPOST } from "./verify/route";
import {
  issueWalletChallenge,
  verifyWalletChallenge,
} from "@/lib/auth/wallet-server";

jest.mock("@/lib/auth/wallet-server", () => ({
  hasTrustedWalletAuthOrigin: jest.fn(() => true),
  issueWalletChallenge: jest.fn(),
  verifyWalletChallenge: jest.fn(),
  checkRateLimit: jest.fn(),
  WalletAuthServiceError: class WalletAuthServiceError extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
    }
  },
}));

const mockIssueWalletChallenge = jest.mocked(issueWalletChallenge);
const mockVerifyWalletChallenge = jest.mocked(verifyWalletChallenge);

function malformedJsonRequest(path: string) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost",
    },
    body: "{",
  });
}

describe("wallet auth routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ["challenge", challengePOST, "/api/auth/wallet/challenge"],
    ["verify", verifyPOST, "/api/auth/wallet/verify"],
  ])(
    "returns 400 for malformed JSON in the %s route",
    async (_name, post, path) => {
      const response = await post(malformedJsonRequest(path));

      expect(response.status).toBe(400);
      expect(response.headers.get("cache-control")).toBe("no-store");
      await expect(response.json()).resolves.toEqual({
        error: "Invalid request body.",
      });
    },
  );

  it("handles GET /api/auth/wallet for challenge request", async () => {
    mockIssueWalletChallenge.mockResolvedValueOnce({
      transaction: "mock-tx",
      network_passphrase: "Test SDF Network ; September 2015",
    });

    const request = new Request(
      "http://localhost/api/auth/wallet?account=GABC",
      {
        method: "GET",
      },
    );
    const response = await walletGET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBeDefined();
    await expect(response.json()).resolves.toEqual({
      transaction: "mock-tx",
      network_passphrase: "Test SDF Network ; September 2015",
    });
    expect(mockIssueWalletChallenge).toHaveBeenCalledWith("GABC");
  });

  it("handles POST /api/auth/wallet with application/x-www-form-urlencoded", async () => {
    mockVerifyWalletChallenge.mockResolvedValueOnce({
      customToken: "token-123",
      account: "GABC",
      walletAddress: "GABC",
    });

    const request = new Request("http://localhost/api/auth/wallet", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: "transaction=signed-xdr",
    });
    const response = await walletPOST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      customToken: "token-123",
      account: "GABC",
      walletAddress: "GABC",
    });
    expect(mockVerifyWalletChallenge).toHaveBeenCalledWith("signed-xdr");
  });

  it("handles OPTIONS preflight requests", async () => {
    const request = new Request("http://localhost/api/auth/wallet", {
      method: "OPTIONS",
      headers: { origin: "https://example.com" },
    });
    const response = await walletOPTIONS(request);
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "https://example.com",
    );
  });
});
