import Cookies from "js-cookie";

/**
 * Single owner of the session cookie.
 *
 * `middleware.ts` lets a request into `/dashboard/*` and `/guest/*` only when
 * this cookie is present. Writing it from one module — driven by Firebase's own
 * token stream — is what keeps login, token refresh and logout in sync; before
 * this, `Register.tsx` was the only writer, `Login.tsx` never wrote it, and
 * nothing ever removed it.
 */
export const SESSION_COOKIE = "firebase-token";

/**
 * A Firebase ID token lives for 60 minutes, so the cookie must not outlive it.
 * The old 7-day cookie kept letting an expired session open every protected
 * route until the browser dropped it.
 */
const ONE_HOUR_IN_DAYS = 1 / 24;

export function setSessionCookie(idToken: string): void {
  Cookies.set(SESSION_COOKIE, idToken, {
    expires: ONE_HOUR_IN_DAYS,
    secure: process.env.NODE_ENV === "production",
    // "strict" drops the cookie on the first navigation from an external link,
    // which is exactly how users arrive from an email or a shared URL.
    sameSite: "lax",
    path: "/",
  });
}

export function clearSessionCookie(): void {
  Cookies.remove(SESSION_COOKIE, { path: "/" });
}
