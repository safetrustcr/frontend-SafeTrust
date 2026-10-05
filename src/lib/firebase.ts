import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { clientEnv } from "@/config/env";

// firebase.ts
const firebaseConfig = {
  apiKey: clientEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: clientEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: clientEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: clientEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: clientEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: clientEnv.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Returns the Firebase Auth instance, initialising the app on first call.
 * Throws only at call-time (not at module-evaluation time) so that SSR /
 * build-time prerendering of pages that don't use auth is not affected.
 *
 * All callers that previously accessed `auth` directly should instead call
 * `getFirebaseAuth()` — or continue using the `auth` re-export below which
 * lazily forwards to this function.
 */
function getFirebaseAuth(): Auth {
  const missing = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length > 0) {
    throw new Error(`Missing Firebase config: ${missing.join(", ")}`);
  }
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app);
}

/**
 * Synchronous auth instance used by components on auth/dashboard routes
 * (Register, ForgotPasswordForm, LogoutButton, Header, EditProfileForm).
 *
 * Accessing this property triggers app initialisation and throws if the
 * Firebase env vars are absent — but only at access time, not when the
 * module is first imported.  This prevents SSR prerender failures on pages
 * that import this module transitively but never touch `auth`.
 *
 * Do NOT import this from public-browse routes (/, /rent, /room) — use
 * `getAuthInstance()` from `@/lib/firebase-app` instead so that
 * firebase/auth is excluded from those page bundles.
 */
export const auth: Auth = new Proxy({} as Auth, {
  get(_target, prop, receiver) {
    return Reflect.get(getFirebaseAuth(), prop, receiver);
  },
  set(_target, prop, value) {
    return Reflect.set(getFirebaseAuth(), prop, value);
  },
  apply(_target, thisArg, args) {
    return Reflect.apply(
      getFirebaseAuth() as unknown as () => unknown,
      thisArg,
      args,
    );
  },
});
