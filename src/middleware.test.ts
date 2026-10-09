/**
 * @jest-environment node
 *
 * Middleware contract tests for issue #545.
 *
 * The middleware must never trust the mere presence of the `firebase-token`
 * cookie: an invalid, expired, or wrong-project token has to redirect to
 * /login and the cookie has to be dropped. Host-only areas are gated on the
 * verified x-hasura-allowed-roles claim, never on client-controlled state.
 *
 * `verifyIdToken` is mocked so these tests exercise the routing/authorization
 * decisions in `middleware.ts` itself. The cryptographic verification is
 * covered separately in `src/lib/auth/verify-id-token.test.ts`, which signs
 * real RSA tokens against a mocked JWKS.
 */

import { NextRequest } from "next/server";

import { middleware } from "@/middleware";

const mockVerifyIdToken = jest.fn();

jest.mock("@/lib/auth/verify-id-token", () => ({
  verifyIdToken: (...args: unknown[]) => mockVerifyIdToken(...args),
}));

const PROJECT_ROLES_CLAIM = "https://hasura.io/jwt/claims";

function makeRequest(pathname: string, cookieValue?: string) {
  const url = `http://localhost:3000${pathname}`;
  const req = new NextRequest(new Request(url));
  if (cookieValue !== undefined) req.cookies.set("firebase-token", cookieValue);
  return req;
}

function claimsWithRoles(roles: string[]) {
  return {
    sub: "uid-1",
    [PROJECT_ROLES_CLAIM]: {
      "x-hasura-default-role": roles[0] ?? "guest",
      "x-hasura-allowed-roles": roles,
      "x-hasura-user-id": "uid-1",
    },
  };
}

beforeEach(() => {
  mockVerifyIdToken.mockReset();
  delete process.env.NEXT_PUBLIC_SKIP_AUTH_MIDDLEWARE;
  delete process.env.SKIP_AUTH_MIDDLEWARE;
});

describe("middleware", () => {
  describe("invalid or missing session", () => {
    it.each([
      ["no cookie at all", undefined],
      ["a garbage cookie value", "x"],
    ])(
      "redirects to /login on a protected route with %s",
      async (_label, cookie) => {
        // Any token that fails verification resolves to null.
        mockVerifyIdToken.mockResolvedValue(null);

        const res = await middleware(makeRequest("/dashboard", cookie));

        expect(res.status).toBe(307);
        const location = new URL(res.headers.get("location") as string);
        expect(location.pathname).toBe("/login");
        expect(location.searchParams.get("redirect")).toBe("/dashboard");
      },
    );

    it("preserves the query string in the redirect parameter", async () => {
      mockVerifyIdToken.mockResolvedValue(null);

      const res = await middleware(makeRequest("/dashboard?tab=history", "x"));

      const location = new URL(res.headers.get("location") as string);
      expect(location.searchParams.get("redirect")).toBe(
        "/dashboard?tab=history",
      );
    });

    it("clears the firebase-token cookie when verification fails", async () => {
      mockVerifyIdToken.mockResolvedValue(null);

      const res = await middleware(
        makeRequest("/dashboard", "expired.jwt.value"),
      );

      // An expired cookie must be dropped so the browser stops resending it.
      const cleared = res.cookies.get("firebase-token");
      expect(cleared?.value).toBe("");
      expect(cleared?.maxAge ?? 0).toBeLessThanOrEqual(0);
    });

    it("never calls verifyIdToken when the cookie is absent", async () => {
      mockVerifyIdToken.mockResolvedValue(null);

      await middleware(makeRequest("/dashboard"));

      expect(mockVerifyIdToken).not.toHaveBeenCalled();
    });
  });

  describe("valid session", () => {
    it("passes a verified guest through a non-host route", async () => {
      mockVerifyIdToken.mockResolvedValue(claimsWithRoles(["guest"]));

      const res = await middleware(makeRequest("/dashboard", "valid.jwt"));

      expect(mockVerifyIdToken).toHaveBeenCalledWith("valid.jwt");
      expect(res.status).toBe(200);
      expect(res.headers.get("location")).toBeNull();
    });
  });

  describe("host-only areas", () => {
    it.each([
      "/dashboard/hotels",
      "/dashboard/hotels/abc/edit",
      "/dashboard/apartments",
      "/dashboard/apartments/xyz/offers",
    ])("rewrites a guest to /403 on %s", async (pathname) => {
      mockVerifyIdToken.mockResolvedValue(claimsWithRoles(["guest"]));

      const res = await middleware(makeRequest(pathname, "valid.jwt"));

      expect(res.status).toBe(200);
      expect(res.headers.get("x-middleware-rewrite")).toContain("/403");
    });

    it.each(["host", "admin"])(
      "lets a %s through a host-only area",
      async (role) => {
        mockVerifyIdToken.mockResolvedValue(claimsWithRoles([role]));

        const res = await middleware(
          makeRequest("/dashboard/hotels", "valid.jwt"),
        );

        expect(res.headers.get("x-middleware-rewrite")).toBeNull();
        expect(res.status).toBe(200);
      },
    );

    it("defaults to guest when the token carries no hasura claims", async () => {
      mockVerifyIdToken.mockResolvedValue({ sub: "uid-1" });

      const res = await middleware(
        makeRequest("/dashboard/hotels", "valid.jwt"),
      );

      expect(res.headers.get("x-middleware-rewrite")).toContain("/403");
    });
  });

  describe("public routes", () => {
    it.each(["/", "/login", "/register", "/rent", "/rent/1"])(
      "allows %s without a token",
      async (pathname) => {
        const res = await middleware(makeRequest(pathname));

        expect(res.status).toBe(200);
        expect(res.headers.get("location")).toBeNull();
        expect(mockVerifyIdToken).not.toHaveBeenCalled();
      },
    );
  });

  describe("booking checkout", () => {
    it.each(["/rent/1/escrow/create", "/rent/1/escrow/esc-123"])(
      "redirects %s to /login without a token",
      async (pathname) => {
        const res = await middleware(makeRequest(pathname));

        expect(res.status).toBe(307);
        expect(res.headers.get("location")).toContain(
          `/login?redirect=${encodeURIComponent(pathname)}`,
        );
      },
    );
  });

  describe("skip escape hatch", () => {
    it("bypasses verification when NEXT_PUBLIC_SKIP_AUTH_MIDDLEWARE is true in non-production", async () => {
      process.env.NEXT_PUBLIC_SKIP_AUTH_MIDDLEWARE = "true";

      const res = await middleware(makeRequest("/dashboard", "x"));

      expect(res.status).toBe(200);
      expect(res.headers.get("location")).toBeNull();
      expect(mockVerifyIdToken).not.toHaveBeenCalled();
    });

    it("bypasses verification when SKIP_AUTH_MIDDLEWARE is true in non-production", async () => {
      process.env.SKIP_AUTH_MIDDLEWARE = "true";

      const res = await middleware(makeRequest("/dashboard", "x"));

      expect(res.status).toBe(200);
      expect(res.headers.get("location")).toBeNull();
      expect(mockVerifyIdToken).not.toHaveBeenCalled();
    });

    it("does not bypass verification in production even if skip env vars are set", async () => {
      const originalEnv = process.env.NODE_ENV;
      try {
        (process.env as Record<string, string | undefined>).NODE_ENV =
          "production";
        process.env.NEXT_PUBLIC_SKIP_AUTH_MIDDLEWARE = "true";
        process.env.SKIP_AUTH_MIDDLEWARE = "true";

        const res = await middleware(makeRequest("/dashboard", "x"));

        // Since cookie "x" is invalid, it must redirect to /login and NOT bypass
        expect(res.status).toBe(307);
        expect(res.headers.get("location")).toContain("/login");
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV =
          originalEnv;
      }
    });
  });
});