export const ACCOUNT_ROUTES = {
  messages: "/dashboard/messages",
  wishlists: "/dashboard/favorites",
  notifications: "/dashboard/notifications",
  profile: "/dashboard/profile",
  /** GA-06: public page for signed-out visitors. */
  guestProfile: "/guest/profile",
} as const;

/** Login link that returns to `target` after sign-in (validated by resolveRedirectPath). */
export const loginHref = (target: string) =>
  `/login?redirect=${encodeURIComponent(target)}`;

/** Register link that returns to `target` after sign-up. */
export const registerHref = (target: string) =>
  `/register?redirect=${encodeURIComponent(target)}`;
