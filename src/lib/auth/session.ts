import { onIdTokenChanged, type Auth, type User } from "firebase/auth";
import Cookies from "js-cookie";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { auth } from "@/lib/firebase";

export const SESSION_COOKIE_NAME = "firebase-token";

/**
 * Sets the firebase-token session cookie and updates the global auth store.
 */
export function setSessionCookie(token: string) {
  Cookies.set(SESSION_COOKIE_NAME, token, {
    expires: 7,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  useGlobalAuthenticationStore.getState().setToken(token);
}

/**
 * Clears the firebase-token session cookie and resets the auth store.
 */
export function clearSessionCookie() {
  Cookies.remove(SESSION_COOKIE_NAME);
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
