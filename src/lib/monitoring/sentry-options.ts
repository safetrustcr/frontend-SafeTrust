import type * as Sentry from "@sentry/nextjs";

type SentryInitOptions = NonNullable<Parameters<typeof Sentry.init>[0]>;
type BeforeSend = NonNullable<SentryInitOptions["beforeSend"]>;

const SENSITIVE_HEADERS = ["authorization", "cookie", "set-cookie"];
const SENSITIVE_COOKIES = ["firebase-token", "session"];
const SENSITIVE_EXTRAS = ["customToken", "signedXdr", "idToken", "secret"];

/**
 * Last line of defence: strip credentials even if an integration or a manual
 * `captureException(..., { extra })` attached them. `dataCollection` below
 * already stops the SDK from collecting most of this.
 */
const scrubEvent: BeforeSend = (event) => {
  const headers = event.request?.headers;
  if (headers) {
    for (const name of Object.keys(headers)) {
      if (SENSITIVE_HEADERS.includes(name.toLowerCase())) delete headers[name];
    }
  }

  const cookies = event.request?.cookies;
  if (cookies) {
    for (const name of SENSITIVE_COOKIES) delete cookies[name];
  }

  if (event.extra) {
    for (const key of SENSITIVE_EXTRAS) delete event.extra[key];
  }

  return event;
};

/**
 * Shared Sentry options for the browser, Node.js and Edge runtimes.
 * Sentry stays disabled (no DSN, no network calls) unless
 * NEXT_PUBLIC_SENTRY_DSN is set.
 */
export const sentryOptions: SentryInitOptions = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  // Sentry v11 replaced `sendDefaultPii` with granular `dataCollection`.
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: { request: { deny: SENSITIVE_HEADERS }, response: false },
    httpBodies: [],
    urlQueryParams: { deny: ["token", "oobCode", "apiKey"] },
  },
  beforeSend: scrubEvent,
};