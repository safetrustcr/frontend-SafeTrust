import * as Sentry from "@sentry/nextjs";

/**
 * Comprehensive sanitization for Sentry error and transaction events.
 * Redacts sensitive information (tokens, authorization headers, XDR, query parameters,
 * request bodies, user PII, and wallet addresses) from all event fields.
 */
export function sanitizeEvent(
  event: Sentry.ErrorEvent,
  _hint?: Sentry.EventHint,
): Sentry.ErrorEvent {
  // 1. Sanitize request (headers, cookies, body data, URL query params)
  if (event.request) {
    if (event.request.headers) {
      const sensitiveHeaderKeys = [
        "authorization",
        "cookie",
        "x-auth-token",
        "x-api-key",
        "api-key",
        "token",
      ];
      for (const key of Object.keys(event.request.headers)) {
        const lowerKey = key.toLowerCase();
        if (
          sensitiveHeaderKeys.includes(lowerKey) ||
          lowerKey.includes("auth") ||
          lowerKey.includes("token") ||
          lowerKey.includes("key")
        ) {
          event.request.headers[key] = "[REDACTED]";
        }
      }
      if (event.request.headers["cookie"]) {
        event.request.headers["cookie"] = sanitizeCookies(
          event.request.headers["cookie"],
        );
      }
      if (event.request.headers["Cookie"]) {
        event.request.headers["Cookie"] = sanitizeCookies(
          event.request.headers["Cookie"],
        );
      }
    }

    if (event.request.cookies) {
      if (
        typeof event.request.cookies === "object" &&
        event.request.cookies !== null
      ) {
        const cookiesObj = event.request.cookies as Record<string, string>;
        for (const cookieKey of Object.keys(cookiesObj)) {
          if (
            cookieKey.toLowerCase().includes("token") ||
            cookieKey.toLowerCase().includes("auth") ||
            cookieKey.toLowerCase().includes("session")
          ) {
            cookiesObj[cookieKey] = "[REDACTED]";
          }
        }
      }
    }

    if (event.request.data) {
      event.request.data = sanitizeObject(event.request.data);
    }

    if (event.request.query_string) {
      event.request.query_string = "[REDACTED]";
    }

    if (event.request.url) {
      event.request.url = sanitizeUrl(event.request.url);
    }
  }

  // 2. Sanitize user data (strip PII and wallet addresses)
  if (event.user) {
    event.user = {
      id: "[REDACTED]",
    };
  }

  // 3. Sanitize breadcrumbs
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
      if (breadcrumb.message) {
        breadcrumb.message = redactSensitiveData(breadcrumb.message);
      }
      if (breadcrumb.data) {
        breadcrumb.data = sanitizeObject(breadcrumb.data) as Record<
          string,
          unknown
        >;
      }
      if (
        breadcrumb.category &&
        breadcrumb.category.toLowerCase().includes("http")
      ) {
        if (
          breadcrumb.data &&
          typeof breadcrumb.data === "object" &&
          "url" in breadcrumb.data
        ) {
          (breadcrumb.data as Record<string, unknown>).url = sanitizeUrl(
            String((breadcrumb.data as Record<string, unknown>).url),
          );
        }
      }
      return breadcrumb;
    });
  }

  // 4. Sanitize exception messages and values
  if (event.exception && event.exception.values) {
    event.exception.values = event.exception.values.map((ex) => {
      if (ex.value) {
        ex.value = redactSensitiveData(ex.value);
      }
      return ex;
    });
  }

  if (event.message) {
    event.message = redactSensitiveData(event.message);
  }

  // 5. Ensure tags include route and auth_method, and NO wallet address
  if (!event.tags) {
    event.tags = {};
  }

  event.tags["auth_method"] = detectAuthMethod();

  if (event.request && event.request.url) {
    try {
      const urlObj = new URL(event.request.url, "https://localhost");
      event.tags["route"] = urlObj.pathname;
    } catch {
      event.tags["route"] = event.request.url.split("?")[0];
    }
  } else if (typeof window !== "undefined") {
    event.tags["route"] = window.location.pathname;
  }

  if (event.tags["wallet_address"]) {
    delete event.tags["wallet_address"];
  }
  if (event.tags["address"]) {
    delete event.tags["address"];
  }

  // 6. Sanitize contexts and extra data
  if (event.contexts) {
    event.contexts = sanitizeObject(event.contexts) as Record<string, unknown>;
  }

  if (event.extra) {
    event.extra = sanitizeObject(event.extra) as Record<string, unknown>;
  }

  return event;
}

export function sanitizeTransactionEvent(
  event: Sentry.Event,
  hint?: Sentry.EventHint,
): Sentry.Event {
  return sanitizeEvent(event as Sentry.ErrorEvent, hint);
}

function sanitizeCookies(cookieHeader: string): string {
  return cookieHeader
    .split(";")
    .map((cookie) => {
      const [name] = cookie.trim().split("=");
      const lowerName = name.trim().toLowerCase();
      if (
        lowerName.includes("token") ||
        lowerName.includes("auth") ||
        lowerName.includes("session")
      ) {
        return `${name}=[REDACTED]`;
      }
      return cookie;
    })
    .join("; ");
}

function sanitizeUrl(urlString: string): string {
  try {
    const url = new URL(
      urlString,
      typeof window !== "undefined"
        ? window.location.origin
        : "https://localhost",
    );
    // Redact sensitive query parameters
    const sensitiveQueryParams = [
      "token",
      "key",
      "secret",
      "auth",
      "password",
      "code",
      "customToken",
    ];
    for (const param of sensitiveQueryParams) {
      if (url.searchParams.has(param)) {
        url.searchParams.set(param, "[REDACTED]");
      }
    }
    return url.pathname + url.search;
  } catch {
    return redactSensitiveData(urlString);
  }
}

function redactSensitiveData(text: string): string {
  if (!text) return text;
  // Redact Stellar public keys (G followed by 55 alphanumeric chars)
  let redacted = text.replace(/G[0-9A-Z]{55}/g, "[REDACTED_WALLET]");
  // Redact Ethereum addresses (0x followed by 40 hex chars)
  redacted = redacted.replace(/0x[a-fA-F0-9]{40}/g, "[REDACTED_WALLET]");
  // Redact potential signed XDR strings (Base64 looking strings starting with AAAA or long base64 blocks)
  redacted = redacted.replace(/AAAA[A-Za-z0-9+/=]{20,}/g, "[REDACTED_XDR]");
  // Redact custom tokens / bearer tokens
  redacted = redacted.replace(
    /bearer\s+[a-zA-Z0-9_\-\.]+/gi,
    "Bearer [REDACTED]",
  );
  redacted = redacted.replace(
    /token[=:][a-zA-Z0-9_\-\.]+/gi,
    "token=[REDACTED]",
  );
  return redacted;
}

function sanitizeObject(obj: unknown): unknown {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes("wallet") ||
      lowerKey.includes("address") ||
      lowerKey.includes("token") ||
      lowerKey.includes("auth") ||
      lowerKey.includes("xdr") ||
      lowerKey.includes("password") ||
      lowerKey.includes("secret")
    ) {
      result[key] = "[REDACTED]";
    } else if (typeof value === "string") {
      result[key] = redactSensitiveData(value);
    } else if (typeof value === "object") {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function detectAuthMethod(): string {
  try {
    if (typeof window === "undefined") return "password";

    const storedAuth = localStorage.getItem("auth-storage");
    if (storedAuth) {
      const parsed = JSON.parse(storedAuth);
      if (parsed?.state?.address || parsed?.state?.isConnected) {
        return "sep10";
      }
    }

    const cookies = document.cookie;
    if (cookies.includes("firebase-token")) {
      const provider = localStorage.getItem("firebase_auth_provider");
      if (provider === "google" || cookies.includes("google")) {
        return "google";
      }
      return "password";
    }
  } catch {
    // fallback
  }
  return "password";
}
