import { getApp, getApps, initializeApp } from "firebase/app";
import type { Auth } from "firebase/auth";

/**
 * firebase-app.ts — Firebase app initialisation, NO firebase/auth import.
 *
 * This file is safe to import from any route (/, /rent, /room, etc.)
 * without pulling firebase/auth into the bundle.
 *
 * Use `getAuthInstance()` in components that need Auth.  It dynamically
 * imports firebase/auth only when first called, so the auth module stays
 * out of public-browse page chunks.
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function getFirebaseApp() {
  const missing = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length > 0) {
    throw new Error(`Missing Firebase config: ${missing.join(", ")}`);
  }
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

/**
 * Lazy Firebase Auth accessor.
 *
 * Dynamically imports `firebase/auth` on first call so the module is only
 * included in chunks that actually perform authentication — never in /, /rent
 * or /room.
 *
 * @example
 *   const [{ signInWithEmailAndPassword }, authInstance] = await Promise.all([
 *     import("firebase/auth"),
 *     getAuthInstance(),
 *   ]);
 *   await signInWithEmailAndPassword(authInstance, email, password);
 */
let _auth: Auth | null = null;
export async function getAuthInstance(): Promise<Auth> {
  if (_auth) return _auth;
  const { getAuth } = await import("firebase/auth");
  _auth = getAuth(getFirebaseApp());
  return _auth;
}
