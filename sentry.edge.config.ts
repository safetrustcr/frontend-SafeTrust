import * as Sentry from "@sentry/nextjs";
import { sanitizeEvent } from "./src/lib/sentry-utils";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  const isPreview = process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" || process.env.NODE_ENV !== "production";
  Sentry.init({
    dsn,
    tracesSampleRate: isPreview ? 1.0 : 0.1,
    sendDefaultPii: false,
    beforeSend: sanitizeEvent,
  } as any);
}
