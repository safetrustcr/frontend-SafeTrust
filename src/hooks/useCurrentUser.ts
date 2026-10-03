"use client";

import { useEffect, useState } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export type Role = "guest" | "host" | "admin";

export type CurrentUser = {
  uid: string;
  email: string | null;
  roles: Role[];
  activeRole: Role;
} | null;

/**
 * Returns the authenticated user's identity and roles derived exclusively
 * from verified Firebase ID token claims (x-hasura-* custom claims set by
 * the backend). Never reads localStorage or any client-controlled value.
 *
 * `loading` is true until the Firebase SDK resolves the initial auth state.
 */
export function useCurrentUser(): { user: CurrentUser; loading: boolean } {
  const [user, setUser] = useState<CurrentUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      onIdTokenChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        const { claims } = await firebaseUser.getIdTokenResult();

        const hasura = claims["https://hasura.io/jwt/claims"] as
          | {
              "x-hasura-allowed-roles"?: Role[];
              "x-hasura-default-role"?: Role;
            }
          | undefined;

        const roles: Role[] = hasura?.["x-hasura-allowed-roles"] ?? ["guest"];
        const activeRole: Role = hasura?.["x-hasura-default-role"] ?? "guest";

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          roles,
          activeRole,
        });
        setLoading(false);
      }),
    [],
  );

  return { user, loading };
}
