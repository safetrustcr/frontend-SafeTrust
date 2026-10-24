import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/config/env.server";

/** Forward a released-escrow claim to the backend (IC-11). */
export async function POST(
  request: NextRequest | Request,
  { params }: { params: Promise<{ escrowId: string }> },
) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const backendUrl = serverEnv.BACKEND_URL;

    if (!backendUrl) {
      return NextResponse.json(
        { error: "BACKEND_NOT_CONFIGURED" },
        { status: 503 },
      );
    }

    const { escrowId } = await params;
    const response = await fetch(
      `${backendUrl}/api/escrow-claims/${encodeURIComponent(escrowId)}`,
      {
        method: "POST",
        headers: {
          Authorization: authorization,
          "Content-Type": "application/json",
        },
        body: await request.text(),
      },
    );

    const contentType = response.headers.get("content-type");
    const data = contentType?.includes("application/json")
      ? await response.json()
      : null;

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || `HTTP_${response.status}` },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Escrow claim API error:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
