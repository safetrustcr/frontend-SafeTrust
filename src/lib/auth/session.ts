import { onIdTokenChanged, type Auth, type User } from "firebase/auth";
import Cookies from "js-cookie";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { auth } from "@/lib/firebase";
import { getRememberMe } from "./persistence";

export const SESSION_COOKIE_NAME = "firebase-token";
export const SESSION_COOKIE = SESSION_COOKIE_NAME;

/**
 * Sets the firebase-token session cookie and updates the global auth store.
 * Honours the Remember Me choice:
 * - When Remember Me is active: cookie expires in 1 hour (1/24 days), kept fresh by onIdTokenChanged.
 * - When Remember Me is unchecked: expires is omitted, creating a browser session cookie.
 */
export function setSessionCookie(idToken: string): void {
  const remember = getRememberMe();
  Cookies.set(SESSION_COOKIE_NAME, idToken, {
    ...(remember ? { expires: 1 / 24 } : {}), // omit expires -> browser-session cookie
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  useGlobalAuthenticationStore.getState().setToken(idToken);
}

/**
 * Clears the firebase-token session cookie and resets the auth store.
 */
export function clearSessionCookie(): void {
  Cookies.remove(SESSION_COOKIE_NAME, { path: "/" });
  useGlobalAuthenticationStore.getState().clearAuth();
}

/**
 * Retrieves the current session token cookie if present.
 */
export function getSessionCookie(): string | undefined {
  return Cookies.get(SESSION_COOKIE_NAME);
}

/**
 * Subscribes to Firebase token changes (including automatic hourly token refreshes)
 * to keep the session cookie and Zustand authentication store in sync.
 */
export function initSessionListener(authInstance: Auth = auth): () => void {
  return onIdTokenChanged(authInstance, async (user: User | null) => {
    if (user) {
      const token = await user.getIdToken();
      setSessionCookie(token);
    } else {
      clearSessionCookie();
    }
  });
}
