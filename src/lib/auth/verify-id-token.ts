import { createRemoteJWKSet, jwtVerify } from "jose";
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
 * The Firebase project ID is read at call time (not module load time) so that
 * test environments can set NEXT_PUBLIC_FIREBASE_PROJECT_ID in beforeAll
 * without running into module-load ordering issues.
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
