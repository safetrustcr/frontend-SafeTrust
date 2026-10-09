import { NextResponse } from "next/server";
import {
  checkRateLimit,
  hasTrustedWalletAuthOrigin,
  verifyWalletChallenge,
  WalletAuthServiceError,
} from "../../../../../lib/auth/wallet-server";

export const runtime = "nodejs";

function getCorsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin") || "*";
  return {
    "cache-control": "no-store",
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

async function parseRequestBody(
  request: Request,
): Promise<Record<string, string | string[]>> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await request.text();
    const params = new URLSearchParams(text);
    const body: Record<string, string> = {};
    for (const [key, value] of params.entries()) {
      body[key] = value;
    }
    return body;
  }
  try {
    const text = await request.text();
    if (!text.trim()) return {};
    return JSON.parse(text);
  } catch {
    throw new WalletAuthServiceError(400, "Invalid request body.");
  }
}

export async function POST(request: Request) {
  if (!hasTrustedWalletAuthOrigin(request)) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403, headers: getCorsHeaders(request) },
    );
  }

  try {
    checkRateLimit(request);
  } catch (error) {
    if (error instanceof WalletAuthServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status, headers: getCorsHeaders(request) },
      );
    }
    return NextResponse.json(
      { error: "Wallet authentication is temporarily unavailable." },
      { status: 503, headers: getCorsHeaders(request) },
    );
  }

  try {
    const body = await parseRequestBody(request);
    if (
      typeof body !== "object" ||
      body === null ||
      !("transaction" in body) ||
      typeof body.transaction !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid wallet challenge." },
        { status: 400, headers: getCorsHeaders(request) },
      );
    }

    const result = await verifyWalletChallenge(body.transaction);
    return NextResponse.json(result, {
      headers: getCorsHeaders(request),
    });
  } catch (error) {
    if (error instanceof WalletAuthServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status, headers: getCorsHeaders(request) },
      );
    }
    return NextResponse.json(
      { error: "Wallet authentication is temporarily unavailable." },
      { status: 503, headers: getCorsHeaders(request) },
    );
  }
}
