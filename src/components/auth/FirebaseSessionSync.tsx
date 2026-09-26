"use client";

import { useEffect } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { useGlobalAuthenticationStore } from "@/core/store/data";

/**
 * Mirrors Firebase's token stream into the session cookie and the auth store.
 *
 * `onIdTokenChanged` fires on sign-in, on sign-out and roughly every 55 minutes
 * when Firebase refreshes the ID token, so mounting this once is enough to keep
 * the cookie, the store and the ID token's real lifetime together. Without it
 * the cookie was written by hand at one call site and never refreshed or
 * cleared.
 */
export function FirebaseSessionSync() {
  const setToken = useGlobalAuthenticationStore((state) => state.setToken);

  useEffect(
    () =>
      onIdTokenChanged(auth, async (user) => {
        if (!user) {
          clearSessionCookie();
          setToken("");
          return;
        }

        const token = await user.getIdToken();
        setSessionCookie(token);
        setToken(token);
      }),
    [setToken],
  );

  return null;
}
