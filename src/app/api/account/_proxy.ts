import { NextResponse } from "next/server";
import { serverEnv } from "@/config/env.server";

export async function proxyToBackend(
  request: Request,
  path: string,
  init: { method?: string } = {},
) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  if (!serverEnv.BACKEND_URL) {
    return NextResponse.json(
      { error: "BACKEND_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  const method = init.method ?? request.method;
  const body =
    method === "GET" || method === "DELETE"
      ? undefined
      : (await request.text()) || undefined;

  let response: Response;
  try {
    response = await fetch(`${serverEnv.BACKEND_URL}${path}`, {
      method,
      headers: {
        Authorization: authorization,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body } : {}),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    console.error("Account backend proxy error:", error);
    return NextResponse.json({ error: "BACKEND_UNREACHABLE" }, { status: 502 });
  }

  if (response.status === 204 || response.status === 205) {
    return NextResponse.json(null, { status: 200 });
  }

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  let data: unknown = null;
  if (isJson) {
    try {
      data = await response.json();
    } catch (error) {
      console.error("Invalid JSON from account backend:", error);
      return NextResponse.json(
        { error: "INVALID_BACKEND_RESPONSE" },
        { status: 502 },
      );
    }
  } else {
    const text = await response.text();
    if (!response.ok) {
      console.error("Non-JSON error from account backend:", response.status);
      return NextResponse.json(
        { error: "BACKEND_REQUEST_FAILED" },
        { status: response.status },
      );
    }
    data = text ? { message: text } : null;
  }

  return NextResponse.json(data, { status: response.status });
}
