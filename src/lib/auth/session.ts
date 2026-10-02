import { onIdTokenChanged, type Auth, type User } from "firebase/auth";
import Cookies from "js-cookie";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { auth } from "@/lib/firebase";

export const SESSION_COOKIE_NAME = "firebase-token";

export function setSessionCookie(token: string) {
  Cookies.set(SESSION_COOKIE_NAME, token, {
    expires: 7,
    path: "/",
    secure: window.location.protocol === "https:",
    sameSite: "strict",
  });
  useGlobalAuthenticationStore.getState().setToken(token);
}

export function clearSessionCookie() {
  Cookies.remove(SESSION_COOKIE_NAME);
  useGlobalAuthenticationStore.getState().clearAuth();
}

export function getSessionCookie(): string | undefined {
  return Cookies.get(SESSION_COOKIE_NAME);
}

export function initSessionListener(authInstance: Auth = auth): () => void {
  return onIdTokenChanged(authInstance, async (user: User | null) => {
    if (!user) {
      clearSessionCookie();
      return;
    }

    try {
      setSessionCookie(await user.getIdToken());
    } catch {
      clearSessionCookie();
    }
  });
}
