import { NextResponse } from "next/server";
import { serverEnv } from "@/config/env.server";

/** Forwards a request to the backend with the caller's bearer token. */
export async function proxyToBackend(
  req: Request,
  path: string,
  init: { method?: string } = {},
): Promise<Response> {
  const authorization = req.headers.get("authorization");
  if (!authorization) {
    return NextResponse.json(
      { error: "Authorization header is required" },
      { status: 401 },
    );
  }

  const backendUrl = serverEnv.BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: "BACKEND_UNAVAILABLE" }, { status: 503 });
  }

  const method = init.method ?? req.method;
  let body: string | undefined;
  if (method !== "GET" && method !== "HEAD") {
    try {
      body = (await req.text()) || undefined;
    } catch {
      body = undefined;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${backendUrl}${path}`, {
      method,
      headers: {
        Authorization: authorization,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body } : {}),
    });
  } catch (error) {
    console.error("Backend proxy error:", error);
    return NextResponse.json({ error: "BACKEND_UNREACHABLE" }, { status: 502 });
  }

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  let data: unknown = {};
  if (isJson && response.status !== 204) {
    try {
      data = await response.json();
    } catch {
      data = {};
    }
  }
  if (response.status === 204 || response.status === 205) {
    return new Response(null, { status: response.status });
  }
  return NextResponse.json(data, { status: response.status });
}
