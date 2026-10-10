// Loaded automatically by Next.js (>= 15.3) in the browser before the app
// becomes interactive. Replaces the legacy sentry.client.config.ts, which is
// only picked up when next.config is wrapped with withSentryConfig.
import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "@/lib/monitoring/sentry-options";

Sentry.init(sentryOptions);

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;