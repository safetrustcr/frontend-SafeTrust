import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// Reports errors thrown in Server Components, route handlers, server actions
// and middleware, tagged with the route path. No-op while Sentry is disabled.
export const onRequestError = Sentry.captureRequestError;