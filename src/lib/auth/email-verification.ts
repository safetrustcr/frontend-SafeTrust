import { sendEmailVerification, type User } from "firebase/auth";
import { resolveRedirectPath } from "./redirect";

/** How long the verify page must wait before offering another send. */
export const RESEND_COOLDOWN_MS = 60_000;

/**
 * Sends Firebase's email-verification link for `user`.
 *
 * Firebase hosts the action link; the `url` is where Firebase returns the
 * visitor after they click it. The destination is passed through
 * `resolveRedirectPath`, so the link can never continue to an off-site URL.
 */
export async function sendVerification(
  user: User,
  continuePath?: string | null,
): Promise<void> {
  const target = resolveRedirectPath(continuePath);
  await sendEmailVerification(user, {
    url: `${window.location.origin}/verify-email?redirect=${encodeURIComponent(target)}`,
  });
}

/**
 * Reloads the Firebase user and forces a new ID token, so `email_verified`
 * reflects the account's current state, then returns it.
 */
export async function refreshVerification(user: User): Promise<boolean> {
  await user.reload();
  if (user.emailVerified) await user.getIdToken(true);
  return user.emailVerified;
}
