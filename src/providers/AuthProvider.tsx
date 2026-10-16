"use client";

import { useEffect, type ReactNode } from "react";
import { initSessionListener } from "@/lib/auth/session";

/**
 * Scoped Firebase Auth provider for route groups that need authentication state.
 *
 * Keeps the Firebase session listener and auth state scoped to (auth), (app),
 * and (checkout) route groups without leaking Firebase auth into public marketing routes.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const unsubscribe = initSessionListener();
    return () => {
      unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
