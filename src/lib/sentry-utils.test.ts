import { sanitizeEvent } from "./sentry-utils";
import * as Sentry from "@sentry/nextjs";

describe("Sentry Sanitization Utilities", () => {
  it("should strip cookies and authorization headers", () => {
    const event = {
      type: "error",
      request: {
        headers: {
          authorization: "Bearer secret-token-123",
          cookie: "firebase-token=secret-cookie-val; other=ok",
        },
        cookies: {
          "firebase-token": "secret-cookie-val",
        },
      },
    } as unknown as Sentry.ErrorEvent;

    const sanitized = sanitizeEvent(event);

    expect(sanitized.request?.headers?.authorization).toBe("[REDACTED]");
    expect(sanitized.request?.headers?.cookie).toBe("[REDACTED]");
    expect(sanitized.request?.cookies?.["firebase-token"]).toBe("[REDACTED]");
  });

  it("should redact wallet addresses and signed XDR from error messages and breadcrumbs", () => {
    const event = {
      type: "error",
      message:
        "Failed to sign with wallet GBU3X7Y2Z1W5V4U3T2S1R0Q9P8O7N6M5L4K3J2I1H0G9F8E7D6C5B4A3 with XDR AAAA1234567890abcdef1234567890abcdef",
      breadcrumbs: [
        {
          message:
            "User sent tx from 0x1234567890abcdef1234567890abcdef12345678",
        },
      ],
      tags: {
        wallet_address:
          "GBU3X7Y2Z1W5V4U3T2S1R0Q9P8O7N6M5L4K3J2I1H0G9F8E7D6C5B4A3",
      },
    } as unknown as Sentry.ErrorEvent;

    const sanitized = sanitizeEvent(event);

    expect(sanitized.message).not.toContain(
      "GBU3X7Y2Z1W5V4U3T2S1R0Q9P8O7N6M5L4K3J2I1H0G9F8E7D6C5B4A3",
    );
    expect(sanitized.message).toContain("[REDACTED_WALLET]");
    expect(sanitized.message).toContain("[REDACTED_XDR]");
    expect(sanitized.breadcrumbs?.[0].message).toContain("[REDACTED_WALLET]");
    expect(sanitized.tags?.["wallet_address"]).toBeUndefined();
    expect(sanitized.tags?.["auth_method"]).toBeDefined();
  });

  it("should extract pathname correctly from relative request url", () => {
    const event = {
      type: "error",
      request: {
        url: "/bookings?id=123",
        query_string: "customToken=secret123",
      },
    } as unknown as Sentry.ErrorEvent;

    const sanitized = sanitizeEvent(event);
    expect(sanitized.tags?.["route"]).toBe("/bookings");
    expect(sanitized.request?.query_string).toBe("[REDACTED]");
  });
});
