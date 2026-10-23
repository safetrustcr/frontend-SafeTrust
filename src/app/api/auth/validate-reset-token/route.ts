import { NextResponse } from "next/server";
import { serverEnv } from "@/config/env.server";
import { authLog } from "@/lib/auth/safe-log";

const TOKEN_PATTERN = /^[A-Za-z0-9._~-]{16,512}$/;
const NO_STORE = { "cache-control": "no-store" };

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token || !TOKEN_PATTERN.test(token)) {
      return NextResponse.json(
        { error: "INVALID_TOKEN" },
        { status: 400, headers: NO_STORE },
      );
    }

    const backendUrl = serverEnv.BACKEND_URL;
    if (!backendUrl) {
      authLog("error", "reset_validate.backend_not_configured");
      return NextResponse.json(
        { error: "UNAVAILABLE" },
        { status: 503, headers: NO_STORE },
      );
    }

    const url = new URL("/api/auth/validate-reset-token", backendUrl);
    url.searchParams.set("token", token);

    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    authLog(response.ok ? "info" : "warn", "reset_validate.result", {
      status: response.status,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "INVALID_TOKEN" },
        {
          status: response.status === 404 ? 404 : 400,
          headers: NO_STORE,
        },
      );
    }

    return NextResponse.json({ valid: true }, { headers: NO_STORE });
  } catch (error) {
    authLog("error", "reset_validate.request_failed", {
      name: error instanceof Error ? error.name : "unknown",
    });
    return NextResponse.json(
      { error: "UNAVAILABLE" },
      { status: 502, headers: NO_STORE },
    );
  }
}
