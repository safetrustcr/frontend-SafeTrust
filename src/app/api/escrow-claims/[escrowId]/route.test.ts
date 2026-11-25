/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { POST } from "./route";

const context = { params: Promise.resolve({ escrowId: "esc 1" }) };

const claimRequest = (headers: Record<string, string> = {}) =>
  new NextRequest("http://localhost/api/escrow-claims/esc%201", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ body: "The fridge was broken", clientOpId: "op-1" }),
  });

describe("/api/escrow-claims/[escrowId] route", () => {
  const originalFetch = global.fetch;
  const originalBackendUrl = process.env.BACKEND_URL;

  beforeEach(() => {
    global.fetch = jest.fn();
    delete process.env.BACKEND_URL;
  });

  afterAll(() => {
    global.fetch = originalFetch;
    if (originalBackendUrl !== undefined) {
      process.env.BACKEND_URL = originalBackendUrl;
    } else {
      delete process.env.BACKEND_URL;
    }
  });

  it("returns 401 without an Authorization header", async () => {
    const response = await POST(claimRequest(), context);
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "UNAUTHENTICATED" });
  });

  it("returns 503 when BACKEND_URL is not set", async () => {
    const response = await POST(
      claimRequest({ Authorization: "Bearer t" }),
      context,
    );
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "BACKEND_NOT_CONFIGURED" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("forwards the claim and returns the backend receipt", async () => {
    process.env.BACKEND_URL = "http://backend:3001";
    const receipt = { id: "c1", status: "submitted", createdAt: "2026-01-01" };
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify(receipt), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
    );

    const response = await POST(
      claimRequest({ Authorization: "Bearer t" }),
      context,
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(receipt);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://backend:3001/api/escrow-claims/esc%201",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer t",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: "The fridge was broken",
          clientOpId: "op-1",
        }),
      }),
    );
  });

  it("passes backend error codes through", async () => {
    process.env.BACKEND_URL = "http://backend:3001";
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify({ error: "ESCROW_NOT_RELEASED" }), {
        status: 409,
        headers: { "content-type": "application/json" },
      }),
    );

    const response = await POST(
      claimRequest({ Authorization: "Bearer t" }),
      context,
    );

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "ESCROW_NOT_RELEASED" });
  });
});
