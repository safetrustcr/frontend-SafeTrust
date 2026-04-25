import { NextRequest, NextResponse } from "next/server";

/**
 * Persists a newly registered Firebase user in the application database.
 * Verifies the Bearer token server-side in a follow-up task if needed.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 });
  }

  // TODO: verify ID token with Firebase Admin and upsert user record
  return NextResponse.json({ ok: true }, { status: 200 });
}
