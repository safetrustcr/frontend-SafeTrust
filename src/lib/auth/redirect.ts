export const DEFAULT_POST_LOGIN_PATH = "/dashboard/escrow-dashboard";

/**
 * Resolves the `?redirect=` parameter that `middleware.ts` appends when it
 * bounces an unauthenticated request to `/login`.
 *
 * Only same-origin absolute paths are accepted. Anything carrying a scheme, an
 * authority, or a protocol-relative `//` (or `/\`) prefix is discarded, so the
 * parameter cannot be turned into an open redirect that hands a freshly
 * authenticated user to another site.
 */
export function resolveRedirectPath(
  target: string | null | undefined,
  fallback: string = DEFAULT_POST_LOGIN_PATH,
): string {
  if (!target) return fallback;

  if (!target.startsWith("/")) return fallback;
  if (target.startsWith("//") || target.startsWith("/\\")) return fallback;

  return target;
}
