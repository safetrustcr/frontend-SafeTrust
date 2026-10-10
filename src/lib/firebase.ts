import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

/**
 * Firebase client config.
 *
 * Each value MUST be read as a literal `process.env.NEXT_PUBLIC_*` expression:
 * Next.js inlines those at build time. Destructuring (`const { env } = process`,
 * `import { env } from "process"`) or indexing (`process.env[key]`) is NOT
 * inlined, so the browser receives `undefined` for every value.
 *
 * Firebase is deliberately not coupled to `clientEnv` (`@/config/env`): that
 * schema also validates unrelated Stellar / Trustless Work variables, and a bad
 * value there must not take down authentication.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} satisfies Record<string, string | undefined>;

const ENV_NAMES: Record<keyof typeof firebaseConfig, string> = {
  apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  storageBucket: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  appId: "NEXT_PUBLIC_FIREBASE_APP_ID",
};

let authInstance: Auth | null = null;

/**
 * Returns the Firebase Auth instance, initialising the app on first call.
 * Throws only at call time (never at import time), so SSR / build-time
 * prerendering of pages that import this module but never touch `auth`
 * is not affected.
 */
export function getFirebaseAuth(): Auth {
  if (authInstance) return authInstance;

  const missing = (Object.keys(ENV_NAMES) as Array<keyof typeof ENV_NAMES>)
    .filter((key) => !firebaseConfig[key])
    .map((key) => ENV_NAMES[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase config: ${missing.join(", ")}. ` +
        "Add them to .env.local in the project root (see .env.example) and restart `npm run dev`.",
    );
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  return authInstance;
}

/**
 * Synchronous auth instance used by components on auth/dashboard routes
 * (Register, ForgotPasswordForm, LogoutButton, Header, EditProfileForm).
 *
 * Property access lazily initialises Firebase (see `getFirebaseAuth`), so
 * importing this module never throws by itself.
 *
 * Do NOT import this from public-browse routes (/, /rent, /room): use
 * `getAuthInstance()` from `@/lib/firebase-app` so firebase/auth stays out
 * of those page bundles.
 */
export const auth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    const instance = getFirebaseAuth();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
  set(_target, prop, value) {
    return Reflect.set(getFirebaseAuth(), prop, value);
  },
  has(_target, prop) {
    return Reflect.has(getFirebaseAuth(), prop);
  },
});