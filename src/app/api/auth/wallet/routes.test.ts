/**
 * @jest-environment node
 */
import { POST as challengePOST } from "./challenge/route";
import { POST as verifyPOST } from "./verify/route";

jest.mock("@/lib/auth/wallet-server", () => ({
  hasTrustedWalletAuthOrigin: jest.fn(() => true),
  issueWalletChallenge: jest.fn(),
  verifyWalletChallenge: jest.fn(),
  WalletAuthServiceError: class WalletAuthServiceError extends Error {},
}));

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
});
