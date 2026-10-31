import { NextResponse } from "next/server";
import { serverEnv } from "@/config/env.server";
import { authLog } from "@/lib/auth/safe-log";

const TOKEN_PATTERN = /^[A-Za-z0-9._~-]{16,512}$/;
const NO_STORE = { "cache-control": "no-store" };

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (typeof token !== "string" || !TOKEN_PATTERN.test(token)) {
      return NextResponse.json(
        { error: "INVALID_TOKEN" },
        { status: 400, headers: NO_STORE },
      );
    }
    if (
      typeof newPassword !== "string" ||
      newPassword.length < 8 ||
      newPassword.length > 128
    ) {
      return NextResponse.json(
        { error: "WEAK_PASSWORD" },
        { status: 400, headers: NO_STORE },
      );
    }
    if (!serverEnv.BACKEND_URL) {
      authLog("error", "reset_password.backend_not_configured");
      return NextResponse.json(
        { error: "UNAVAILABLE" },
        { status: 503, headers: NO_STORE },
      );
    }

    const response = await fetch(
      `${serverEnv.BACKEND_URL}/api/auth/reset-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );
    authLog(response.ok ? "info" : "warn", "reset_password.result", {
      status: response.status,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: response.status === 400 || response.status === 404 ? "INVALID_TOKEN" : "UNAVAILABLE" },
        { status: response.status === 404 ? 404 : response.status === 400 ? 400 : 502, headers: NO_STORE },
      );
    }

    return NextResponse.json({ success: true }, { headers: NO_STORE });
  } catch (error) {
    authLog("error", "reset_password.request_failed", {
      name: error instanceof Error ? error.name : "unknown",
    });
    return NextResponse.json(
      { error: "UNAVAILABLE" },
      { status: 502, headers: NO_STORE },
    );
  }
}
