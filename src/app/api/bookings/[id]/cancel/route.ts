import { NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";

const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!SAFE_ID.test(id)) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return proxyToBackend(request, `/api/reservations/${id}/cancel`, {
    method: "POST",
  });
}
