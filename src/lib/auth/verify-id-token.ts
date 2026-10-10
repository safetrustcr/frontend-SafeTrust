import { createRemoteJWKSet, decodeJwt, jwtVerify } from "jose";
import type { JWTPayload } from "jose";

const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

export type SafeTrustClaims = JWTPayload & {
  "https://hasura.io/jwt/claims"?: {
    "x-hasura-default-role": "guest" | "host" | "admin";
    "x-hasura-allowed-roles": Array<"guest" | "host" | "admin">;
    "x-hasura-user-id": string;
  };
};

/**
 * Verifies the Firebase ID token's signature, issuer, audience, and expiry
 * using JWKS — Edge-compatible, no Admin SDK required.
 *
 * In emulator mode (NEXT_PUBLIC_USE_AUTH_EMULATOR=true), decodes and validates
 * claims locally since emulator-issued tokens are not signed with Google's production keys.
 *
 * Returns the verified JWT payload (including Hasura custom claims) on
 * success, or `null` if the token is forged, expired, or belongs to a
 * different Firebase project.
 */
export async function verifyIdToken(
  token: string,
): Promise<SafeTrustClaims | null> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return null;

  // Emulator tokens are unsigned, so this branch skips signature checks.
  // Firebase reserves the "demo-" prefix for emulator-only projects, so
  // requiring it (AND an emulator flag) keeps this unreachable for a real
  // project even if an emulator env var leaks into production.
  const isEmulator =
    projectId.startsWith("demo-") &&
    (process.env.NEXT_PUBLIC_USE_AUTH_EMULATOR === "true" ||
      Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST));

  if (isEmulator) {
    try {
      const payload = decodeJwt<SafeTrustClaims>(token);
      const isExpectedAud =
        payload.aud === projectId ||
        (Array.isArray(payload.aud) && payload.aud.includes(projectId));
      const isExpectedIss =
        payload.iss === `https://securetoken.google.com/${projectId}` ||
        payload.iss === projectId;
      const isExpired = payload.exp ? payload.exp * 1000 < Date.now() : false;

      if (isExpectedAud && isExpectedIss && !isExpired && payload.sub) {
        return payload;
      }
      return null;
    } catch {
      return null;
    }
  }

  try {
    const { payload } = await jwtVerify<SafeTrustClaims>(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
      algorithms: ["RS256"],
      requiredClaims: ["exp", "sub"],
    });
    return payload;
  } catch {
    return null;
  }
}