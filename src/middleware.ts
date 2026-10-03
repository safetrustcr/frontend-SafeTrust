import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/auth/verify-id-token";

const PROTECTED_PREFIXES = ["/dashboard", "/guest", "/bookings"];

const PROTECTED_PATTERNS = [/^\/hotels\/[^/]+\/book(\/.*)?$/];

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/new-password",
  "/reset-password",
  "/verify-email",
  "/rent",
]);

/**
 * Determines whether a request targets an authenticated application route.
 * Public pages and static assets are excluded before protected prefixes are checked.
 */
function isProtected(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return false;

  if (PROTECTED_PATTERNS.some((re) => re.test(pathname))) return true;

  if (/^\/(rent|room|hotels)(\/|$)/.test(pathname)) return false;

  // Protected routes must take precedence over static-file exclusions.
  if (
    PROTECTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    return true;
  }

  // Next.js internals and static assets should pass through untouched.
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/img/") ||
    pathname.startsWith("/styles/") ||
    pathname.includes(".")
  ) {
    return false;
  }

  return false;
}

/**
 * Enforces cryptographic Firebase token verification for protected routes.
 *
 * The token is verified via JWKS (Edge-compatible, no Admin SDK required).
 * An invalid, expired, or wrong-project cookie is deleted and the user is
 * redirected to /login. Host-only areas (/dashboard/hotels, /dashboard/apartments)
 * are guarded by the x-hasura-allowed-roles claim; guests are rewritten to /403.
 */
export async function middleware(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_SKIP_AUTH_MIDDLEWARE === "true") {
    return NextResponse.next();
  }

  const { pathname, search } = req.nextUrl;

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("firebase-token")?.value;
  const claims = token ? await verifyIdToken(token) : null;

  if (!claims) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    const res = NextResponse.redirect(loginUrl);
    // Drop an invalid or expired cookie so the browser doesn't keep sending it.
    res.cookies.delete("firebase-token");
    return res;
  }

  // Host-only areas: require "host" or "admin" in allowed-roles claim.
  const isHostArea =
    pathname.startsWith("/dashboard/hotels") ||
    pathname.startsWith("/dashboard/apartments");

  if (isHostArea) {
    const allowedRoles = claims["https://hasura.io/jwt/claims"]?.[
      "x-hasura-allowed-roles"
    ] ?? ["guest"];
    if (!allowedRoles.includes("host") && !allowedRoles.includes("admin")) {
      return NextResponse.rewrite(new URL("/403", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
