/**
 * @jest-environment node
 */
import { proxyToBackend } from "./proxy";

describe("proxyToBackend", () => {
  const originalFetch = global.fetch;
  const originalBackendUrl = process.env.BACKEND_URL;

  beforeEach(() => {
    global.fetch = jest.fn();
    process.env.BACKEND_URL = "https://backend.safetrust.test";
  });

  afterAll(() => {
    global.fetch = originalFetch;
    if (originalBackendUrl !== undefined) {
      process.env.BACKEND_URL = originalBackendUrl;
    } else {
      delete process.env.BACKEND_URL;
    }
  });

  const makeRequest = (headers: Record<string, string> = {}, body?: string) =>
    new Request("http://localhost/api/bookings/b1/cancel", {
      method: "POST",
      headers,
      body,
    });

  it("returns 401 without an Authorization header", async () => {
    const res = await proxyToBackend(makeRequest(), "/api/reservations");
    expect(res.status).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns 503 when BACKEND_URL is not configured", async () => {
    delete process.env.BACKEND_URL;
    const res = await proxyToBackend(
      makeRequest({ authorization: "Bearer t" }),
      "/api/reservations",
    );
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "BACKEND_UNAVAILABLE" });
  });

  it("forwards method, Authorization and body and returns the backend JSON", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify({ id: "b1" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const res = await proxyToBackend(
      makeRequest({ authorization: "Bearer t" }, '{"reason":"x"}'),
      "/api/reservations/b1/cancel",
      { method: "POST" },
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "https://backend.safetrust.test/api/reservations/b1/cancel",
      expect.objectContaining({
        method: "POST",
        body: '{"reason":"x"}',
        headers: expect.objectContaining({ Authorization: "Bearer t" }),
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: "b1" });
  });

  it("passes a 409 status and body through unchanged", async () => {
    const payload = { error: "RESERVATION_NOT_CANCELLABLE", status: "funded" };
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 409,
        headers: { "content-type": "application/json" },
      }),
    );
    const res = await proxyToBackend(
      makeRequest({ authorization: "Bearer t" }),
      "/api/reservations/b1/cancel",
      { method: "POST" },
    );
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual(payload);
  });

  it("returns 502 when the backend is unreachable", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new TypeError("fetch failed"),
    );
    const res = await proxyToBackend(
      makeRequest({ authorization: "Bearer t" }),
      "/api/reservations",
    );
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "BACKEND_UNREACHABLE" });
  });

  it("passes a 204 through without treating it as unreachable", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response(null, { status: 204 }),
    );
    const res = await proxyToBackend(
      makeRequest({ authorization: "Bearer t" }),
      "/api/reservations",
    );
    expect(res.status).toBe(204);
  });

  it("passes the status through for a non-JSON body", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response("<html>bad gateway</html>", {
        status: 500,
        headers: { "content-type": "text/html" },
      }),
    );
    const res = await proxyToBackend(
      makeRequest({ authorization: "Bearer t" }),
      "/api/reservations",
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({});
  });
});
