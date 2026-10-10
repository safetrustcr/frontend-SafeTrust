import {
  GoogleAuthProvider,
  getAdditionalUserInfo,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  type UserCredential,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";
import { setSessionCookie } from "@/lib/auth/session";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

async function finishSignIn(cred: UserCredential) {
  const idToken = await cred.user.getIdToken();
  setSessionCookie(idToken); // before navigating, so middleware sees it
  if (getAdditionalUserInfo(cred)?.isNewUser) {
    // Same backend sync as email registration; best-effort (backend may be offline in skeleton mode).
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    await fetch("/api/auth/sync-user", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      // Same payload shape as Register.tsx; phone/location are completed later in /dashboard/profile.
      body: JSON.stringify({
        first_name: cred.user.displayName?.split(" ")[0] ?? "",
        last_name: cred.user.displayName?.split(" ").slice(1).join(" ") ?? "",
      }),
    })
      .catch(() => undefined)
      .finally(() => clearTimeout(timeoutId));
  }
  return cred.user;
}

/** Popup first; falls back to a full-page redirect when popups are blocked. */
export async function signInWithGoogle() {
  try {
    return await finishSignIn(await signInWithPopup(auth, provider));
  } catch (err) {
    if (err instanceof FirebaseError && err.code === "auth/popup-blocked") {
      await signInWithRedirect(auth, provider);
      return null; // page navigates away
    }
    throw err;
  }
}

/** Call once on /login mount to complete a redirect sign-in. */
export async function completeGoogleRedirect() {
  const cred = await getRedirectResult(auth);
  return cred ? finishSignIn(cred) : null;
}

export const GOOGLE_ERROR_MESSAGES: Record<string, string | null> = {
  "auth/popup-closed-by-user": null, // user cancelled: no toast
  "auth/cancelled-popup-request": null,
  "auth/account-exists-with-different-credential":
    "This email is already registered with a password. Sign in with email, then link Google from your profile.",
  "auth/network-request-failed":
    "Network error. Check your connection and try again.",
  "auth/unauthorized-domain":
    "Google sign-in isn't enabled for this domain yet.",
  "auth/operation-not-allowed":
    "Google sign-in is not enabled. Contact support.",
};
