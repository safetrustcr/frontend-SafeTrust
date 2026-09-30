import * as Sentry from "@sentry/nextjs";

/**
   * Redacts sensitive information (tokens, authorization headers, XDR, wallet addresses)
   * from error events, messages, breadcrumbs, and extra data.
   */
export function sanitizeEvent(event: Sentry.ErrorEvent, _hint?: Sentry.EventHint): Sentry.ErrorEvent {
  // 1. Sanitize headers and cookies
  if (event.request) {
    if (event.request.headers) {
      if (event.request.headers["authorization"]) {
        event.request.headers["authorization"] = "[REDACTED]";
      }
      if (event.request.headers["Authorization"]) {
        event.request.headers["Authorization"] = "[REDACTED]";
      }
      if (event.request.headers["cookie"]) {
        event.request.headers["cookie"] = sanitizeCookies(event.request.headers["cookie"]);
      }
      if (event.request.headers["Cookie"]) {
        event.request.headers["Cookie"] = sanitizeCookies(event.request.headers["Cookie"]);
      }
    }
    if (event.request.cookies) {
      if (typeof event.request.cookies === "object" && event.request.cookies !== null) {
        const cookiesObj = event.request.cookies as Record<string, string>;
        if (cookiesObj["firebase-token"]) {
          cookiesObj["firebase-token"] = "[REDACTED]";
        }
      }
    }
  }

  // 2. Sanitize breadcrumbs
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
      if (breadcrumb.message) {
        breadcrumb.message = redactSensitiveData(breadcrumb.message);
      }
      if (breadcrumb.data) {
        breadcrumb.data = sanitizeObject(breadcrumb.data) as Record<string, any>;
      }
      return breadcrumb;
    });
  }

  // 3. Sanitize exception message and values
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

  // 4. Ensure tags include route and auth_method, and NO wallet address
  if (!event.tags) {
    event.tags = {};
  }

  // Determine auth method
  event.tags["auth_method"] = detectAuthMethod();

  // Determine route if possible
  if (event.request && event.request.url) {
    try {
      const urlObj = new URL(event.request.url);
      event.tags["route"] = urlObj.pathname;
    } catch {
      event.tags["route"] = event.request.url;
    }
  } else if (typeof window !== "undefined") {
    event.tags["route"] = window.location.pathname;
  }

  // Ensure wallet address is NEVER present in tags, extra, or context
  if (event.tags["wallet_address"]) {
    delete event.tags["wallet_address"];
  }
  if (event.tags["address"]) {
    delete event.tags["address"];
  }

  if (event.extra) {
    event.extra = sanitizeObject(event.extra) as Record<string, unknown>;
  }

  return event;
}

function sanitizeCookies(cookieHeader: string): string {
  return cookieHeader
    .split(";")
    .map((cookie) => {
      const [name] = cookie.trim().split("=");
      if (name.trim() === "firebase-token") {
        return `${name}=${encodeURIComponent("[REDACTED]")}`;
      }
      return cookie;
    })
    .join("; ");
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
  redacted = redacted.replace(/bearer\s+[a-zA-Z0-9_\-\.]+/gi, "Bearer [REDACTED]");
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
      lowerKey.includes("xdr")
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

    // Check if stellar wallet / sep10 is active
    const storedAuth = localStorage.getItem("auth-storage");
    if (storedAuth) {
      const parsed = JSON.parse(storedAuth);
      if (parsed?.state?.address || parsed?.state?.isConnected) {
        return "sep10";
      }
    }

    // Check cookies for firebase token
    const cookies = document.cookie;
    if (cookies.includes("firebase-token")) {
      // Check if google login was used (could be stored in localstorage or session)
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
