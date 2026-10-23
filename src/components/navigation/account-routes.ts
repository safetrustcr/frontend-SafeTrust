export const loginHref = (target: string) =>
  `/login?redirect=${encodeURIComponent(target)}`;
