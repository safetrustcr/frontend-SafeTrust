export const ACCOUNT_ROUTES = {
  messages: "/dashboard/messages",
  wishlists: "/dashboard/favorites",
  notifications: "/dashboard/notifications",
  profile: "/dashboard/profile",
} as const;

/** Login link that returns to `target` after sign-in (validated by resolveRedirectPath). */
export const loginHref = (target: string) =>
  `/login?redirect=${encodeURIComponent(target)}`;

/** Sign-up link that returns to `target` after the account is created. */
export const registerHref = (target: string) =>
  `/register?redirect=${encodeURIComponent(target)}`;
