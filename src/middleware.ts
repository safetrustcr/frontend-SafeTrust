import { NextRequest, NextResponse } from "next/server";

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
 * Enforces the lightweight Edge-compatible Firebase cookie check for protected routes.
 * Token signature verification remains in the server-side authentication boundary.
 */
export function middleware(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_SKIP_AUTH_MIDDLEWARE === "true") {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  // Firebase Admin cannot run in Next.js Edge middleware. The token is
  // verified server-side by the auth API, while middleware checks presence.
  const token = req.cookies.get("firebase-token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
