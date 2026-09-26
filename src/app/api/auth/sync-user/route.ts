import { NextResponse } from "next/server";
import { serverEnv } from "@/config/env.server";

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 },
      );
    }

    const backendUrl = serverEnv.BACKEND_URL;

    if (!backendUrl) {
        // Backend not configured — skip sync silently in standalone mode
        console.warn("BACKEND_URL not set — skipping user sync");
        return NextResponse.json({ success: true, synced: false });
    }

    const response = await fetch(`${backendUrl}/api/auth/sync-user`, {
      method: "POST",
      headers: {
        Authorization: authorization,
      },
    });

    const contentType = response.headers.get("content-type");
    const data = contentType?.includes("application/json")
      ? await response.json()
      : null;

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || "Failed to sync user" },
        { status: response.status },
      );
    }

    return NextResponse.json(data ?? { success: true });
  } catch (error) {
    console.error("Sync user API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
