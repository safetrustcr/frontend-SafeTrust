import "server-only";

type AuthLogLevel = "info" | "warn" | "error";
type SafeField = string | number | boolean | undefined;

/**
 * Emits structured auth events containing only fields explicitly selected by
 * the caller. Never pass credentials, request bodies, URLs, or user PII here.
 */
export function authLog(
  level: AuthLogLevel,
  event: string,
  fields: Record<string, SafeField> = {},
) {
  const entry = JSON.stringify({ scope: "auth", event, ...fields });
  if (level === "error") console.error(entry);
  else if (level === "warn") console.warn(entry);
  else console.info(entry);
}
