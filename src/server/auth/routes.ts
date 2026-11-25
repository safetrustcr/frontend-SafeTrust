import "server-only";
import { NextResponse } from "next/server";
import {
  checkRateLimit,
  hasTrustedWalletAuthOrigin,
  issueWalletChallenge,
  verifyWalletChallenge,
  WalletAuthServiceError,
} from "./sep10";

function getCorsHeaders(request: Request, methods: string): HeadersInit {
  return {
    "cache-control": "no-store",
    "access-control-allow-origin": request.headers.get("origin") || "*",
    "access-control-allow-methods": methods,
    "access-control-allow-headers": "Content-Type, Authorization",
  };
}

function errorResponse(error: unknown, headers: HeadersInit) {
  if (error instanceof WalletAuthServiceError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status, headers },
    );
  }
  return NextResponse.json(
    { error: "Wallet authentication is temporarily unavailable." },
    { status: 503, headers },
  );
}

async function parseRequestBody(
  request: Request,
): Promise<Record<string, string | string[]>> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(await request.text());
    const body: Record<string, string> = {};
    for (const [key, value] of params.entries()) body[key] = value;
    return body;
  }
  try {
    const text = await request.text();
    if (!text.trim()) return {};
    return JSON.parse(text) as Record<string, string | string[]>;
  } catch {
    throw new WalletAuthServiceError(400, "Invalid request body.");
  }
}

export function walletOPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request, "GET, POST, OPTIONS"),
  });
}

export async function walletGET(request: Request) {
  const headers = getCorsHeaders(request, "GET, POST, OPTIONS");
  if (!hasTrustedWalletAuthOrigin(request)) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403, headers },
    );
  }
  try {
    checkRateLimit(request);
    const account = new URL(request.url).searchParams.get("account");
    if (!account) {
      return NextResponse.json(
        { error: "Missing Stellar account." },
        { status: 400, headers },
      );
    }
    return NextResponse.json(await issueWalletChallenge(account), { headers });
  } catch (error) {
    return errorResponse(error, headers);
  }
}

export async function walletPOST(request: Request) {
  const headers = getCorsHeaders(request, "GET, POST, OPTIONS");
  if (!hasTrustedWalletAuthOrigin(request)) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403, headers },
    );
  }
  try {
    checkRateLimit(request);
    const body = await parseRequestBody(request);
    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400, headers },
      );
    }
    if (typeof body.account === "string") {
      return NextResponse.json(await issueWalletChallenge(body.account), {
        headers,
      });
    }
    if (typeof body.transaction === "string") {
      return NextResponse.json(await verifyWalletChallenge(body.transaction), {
        headers,
      });
    }
    return NextResponse.json(
      { error: "Invalid request parameters." },
      { status: 400, headers },
    );
  } catch (error) {
    return errorResponse(error, headers);
  }
}

export function walletChallengeOPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request, "POST, OPTIONS"),
  });
}

export async function walletChallengePOST(request: Request) {
  const headers = getCorsHeaders(request, "POST, OPTIONS");
  if (!hasTrustedWalletAuthOrigin(request)) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403, headers },
    );
  }
  try {
    checkRateLimit(request);
    const body = await parseRequestBody(request);
    if (typeof body.account !== "string") {
      return NextResponse.json(
        { error: "Invalid Stellar account." },
        { status: 400, headers },
      );
    }
    return NextResponse.json(await issueWalletChallenge(body.account), {
      headers,
    });
  } catch (error) {
    return errorResponse(error, headers);
  }
}

export function walletVerifyOPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request, "POST, OPTIONS"),
  });
}

export async function walletVerifyPOST(request: Request) {
  const headers = getCorsHeaders(request, "POST, OPTIONS");
  if (!hasTrustedWalletAuthOrigin(request)) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403, headers },
    );
  }
  try {
    checkRateLimit(request);
  } catch (error) {
    return errorResponse(error, headers);
  }
  try {
    const body = await parseRequestBody(request);
    if (typeof body.transaction !== "string") {
      return NextResponse.json(
        { error: "Invalid wallet challenge." },
        { status: 400, headers },
      );
    }
    return NextResponse.json(await verifyWalletChallenge(body.transaction), {
      headers,
    });
  } catch (error) {
    return errorResponse(error, headers);
  }
}
