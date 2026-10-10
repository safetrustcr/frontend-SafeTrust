import type { Page, Route } from "@playwright/test";

/**
 * In-browser mock of the Firebase Auth REST API (Identity Toolkit + Secure
 * Token) for E2E tests.
 *
 * The real Firebase JS SDK, the real login form, the session cookie and the
 * real Next.js middleware all still run. Only the network calls the SDK makes
 * are answered here from a seeded user list, so the tests need no Auth
 * emulator process, no network, and no backend.
 *
 * Tokens use the same unsigned format the Auth emulator issues. The
 * middleware accepts them only for a "demo-" project with
 * NEXT_PUBLIC_USE_AUTH_EMULATOR=true (see src/lib/auth/verify-id-token.ts),
 * which is exactly how playwright.config.ts starts the app.
 */

export const PROJECT_ID = "demo-safetrust";

export type Role = "guest" | "host" | "admin";

export type MockUser = {
  uid: string;
  email: string;
  password: string;
  displayName: string;
  roles: Role[];
};

export const MOCK_USERS = {
  guest: {
    uid: "e2e-guest-1",
    email: "ana.guest@safetrust.test",
    password: "Guest-Password-123!",
    displayName: "Ana Guest",
    roles: ["guest"],
  },
  host: {
    uid: "e2e-host-1",
    email: "carlos.host@safetrust.test",
    password: "Host-Password-123!",
    displayName: "Carlos Host",
    roles: ["guest", "host"],
  },
} satisfies Record<string, MockUser>;

const IDENTITY_TOOLKIT =
  /\/identitytoolkit\.googleapis\.com\/v1\/accounts:(\w+)/;
const SECURE_TOKEN = /\/securetoken\.googleapis\.com\/v1\/token/;

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
};

const b64url = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");

/** Unsigned ID token in the Auth emulator's format, with Hasura role claims. */
export function buildIdToken(user: MockUser, ttlSeconds = 3600): string {
  const now = Math.floor(Date.now() / 1000);
  const defaultRole = user.roles.includes("host") ? "host" : user.roles[0];
  const payload = {
    iss: `https://securetoken.google.com/${PROJECT_ID}`,
    aud: PROJECT_ID,
    auth_time: now,
    user_id: user.uid,
    sub: user.uid,
    iat: now,
    exp: now + ttlSeconds,
    email: user.email,
    email_verified: true,
    name: user.displayName,
    firebase: {
      identities: { email: [user.email] },
      sign_in_provider: "password",
    },
    "https://hasura.io/jwt/claims": {
      "x-hasura-default-role": defaultRole,
      "x-hasura-allowed-roles": user.roles,
      "x-hasura-user-id": user.uid,
    },
  };
  return `${b64url({ alg: "none", typ: "JWT" })}.${b64url(payload)}.`;
}

function accountInfo(user: MockUser) {
  const now = String(Date.now());
  return {
    localId: user.uid,
    email: user.email,
    emailVerified: true,
    displayName: user.displayName,
    providerUserInfo: [
      {
        providerId: "password",
        email: user.email,
        federatedId: user.email,
        rawId: user.email,
        displayName: user.displayName,
      },
    ],
    validSince: String(Math.floor(Date.now() / 1000) - 60),
    lastLoginAt: now,
    createdAt: now,
  };
}

/** Same body shape the real Identity Toolkit returns for errors. */
function firebaseError(route: Route, message: string) {
  return route.fulfill({
    status: 400,
    headers: CORS_HEADERS,
    contentType: "application/json",
    body: JSON.stringify({
      error: {
        code: 400,
        message,
        errors: [{ message, domain: "global", reason: "invalid" }],
      },
    }),
  });
}

export type MockAuth = {
  /** Every Firebase REST call the app made, e.g. "signInWithPassword". */
  calls: string[];
  /** Same-origin /api/* calls that no test mocked (they fail with 501). */
  unmockedApiCalls: string[];
};

/**
 * Installs the Firebase Auth mock on `page` and makes any un-mocked
 * same-origin `/api/*` request fail loudly (501 + recorded) instead of
 * silently hitting a route or backend that doesn't exist in E2E.
 *
 * Register extra `/api/*` mocks with `page.route` AFTER calling this:
 * Playwright runs the most recently registered matching handler first.
 */
export async function mockFirebaseAuth(
  page: Page,
  users: MockUser[] = Object.values(MOCK_USERS),
): Promise<MockAuth> {
  const byEmail = new Map(users.map((u) => [u.email.toLowerCase(), u]));
  const byUid = new Map(users.map((u) => [u.uid, u]));
  const state: MockAuth = { calls: [], unmockedApiCalls: [] };

  const isAppApi = (url: URL) =>
    (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
    url.pathname.startsWith("/api/");

  await page.route(isAppApi, (route) => {
    const url = new URL(route.request().url());
    state.unmockedApiCalls.push(`${route.request().method()} ${url.pathname}`);
    return route.fulfill({
      status: 501,
      contentType: "application/json",
      body: JSON.stringify({ error: `Not mocked in E2E: ${url.pathname}` }),
    });
  });

  await page.route(IDENTITY_TOOLKIT, async (route) => {
    const request = route.request();
    if (request.method() === "OPTIONS") {
      return route.fulfill({ status: 204, headers: CORS_HEADERS });
    }

    const action = IDENTITY_TOOLKIT.exec(request.url())?.[1] ?? "unknown";
    state.calls.push(action);
    const body = (request.postDataJSON() ?? {}) as Record<string, unknown>;

    if (action === "signInWithPassword") {
      const user = byEmail.get(String(body.email ?? "").toLowerCase());
      // Firebase (with email-enumeration protection) returns the same error
      // for an unknown email and a wrong password.
      if (!user || user.password !== body.password) {
        return firebaseError(route, "INVALID_LOGIN_CREDENTIALS");
      }
      return route.fulfill({
        status: 200,
        headers: CORS_HEADERS,
        contentType: "application/json",
        body: JSON.stringify({
          kind: "identitytoolkit#VerifyPasswordResponse",
          localId: user.uid,
          email: user.email,
          displayName: user.displayName,
          idToken: buildIdToken(user),
          registered: true,
          refreshToken: `refresh-${user.uid}`,
          expiresIn: "3600",
        }),
      });
    }

    if (action === "lookup") {
      const token = String(body.idToken ?? "");
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1] ?? "", "base64url").toString() || "{}",
      ) as { sub?: string };
      const user = payload.sub ? byUid.get(payload.sub) : undefined;
      if (!user) return firebaseError(route, "INVALID_ID_TOKEN");
      return route.fulfill({
        status: 200,
        headers: CORS_HEADERS,
        contentType: "application/json",
        body: JSON.stringify({
          kind: "identitytoolkit#GetAccountInfoResponse",
          users: [accountInfo(user)],
        }),
      });
    }

    return firebaseError(route, `OPERATION_NOT_ALLOWED: ${action} not mocked`);
  });

  await page.route(SECURE_TOKEN, async (route) => {
    const request = route.request();
    if (request.method() === "OPTIONS") {
      return route.fulfill({ status: 204, headers: CORS_HEADERS });
    }
    state.calls.push("refreshToken");
    const refreshToken =
      new URLSearchParams(request.postData() ?? "").get("refresh_token") ?? "";
    const user = byUid.get(refreshToken.replace(/^refresh-/, ""));
    if (!user) return firebaseError(route, "INVALID_REFRESH_TOKEN");
    const idToken = buildIdToken(user);
    return route.fulfill({
      status: 200,
      headers: CORS_HEADERS,
      contentType: "application/json",
      body: JSON.stringify({
        access_token: idToken,
        id_token: idToken,
        expires_in: "3600",
        token_type: "Bearer",
        refresh_token: refreshToken,
        user_id: user.uid,
        project_id: PROJECT_ID,
      }),
    });
  });

  return state;
}