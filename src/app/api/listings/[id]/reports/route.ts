import { NextResponse } from "next/server";
import {
  isApartmentId,
  isReportCategory,
} from "@/features/listings/report-schema";
import { clientEnv } from "@/config/env";
import { serverEnv } from "@/config/env.server";

const unavailable = () =>
  NextResponse.json({ error: "BACKEND_NOT_CONFIGURED" }, { status: 503 });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isApartmentId(id)) return unavailable();

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const backendUrl = serverEnv.BACKEND_URL;
  if (clientEnv.NEXT_PUBLIC_DEMO_MODE === "true" || !backendUrl) {
    return unavailable();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_REPORT" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "INVALID_REPORT" }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  if (
    !isReportCategory(input.category) ||
    typeof input.clientOpId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      input.clientOpId,
    ) ||
    (input.details !== undefined &&
      (typeof input.details !== "string" || input.details.length > 1000)) ||
    (input.category === "other" &&
      (typeof input.details !== "string" || input.details.trim().length < 10))
  ) {
    return NextResponse.json({ error: "INVALID_REPORT" }, { status: 400 });
  }

  try {
    const normalizedBackendUrl = backendUrl.replace(/\/+$/, "");
    const response = await fetch(
      `${normalizedBackendUrl}/api/apartments/${encodeURIComponent(id)}/reports`,
      {
        method: "POST",
        signal: AbortSignal.timeout(10_000),
        headers: {
          Authorization: authorization,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: input.category,
          ...(typeof input.details === "string" && input.details.trim()
            ? { details: input.details.trim() }
            : {}),
          clientOpId: input.clientOpId,
        }),
      },
    );
    const contentType = response.headers.get("content-type");
    const data = contentType?.includes("application/json")
      ? await response.json()
      : { error: `HTTP_${response.status}` };
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Listing report proxy error:", error);
    return NextResponse.json(
      { error: "REPORT_SERVICE_UNAVAILABLE" },
      {
        status: 502,
      },
    );
  }
}
