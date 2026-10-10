/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { POST } from "./route";

describe("/api/auth/sync-user route", () => {
  const originalFetch = global.fetch;
  const originalBackendUrl = process.env.BACKEND_URL;

  beforeEach(() => {
    jest.clearAllMocks();
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

  it("returns 401 when Authorization header is missing", async () => {
    const request = new NextRequest("http://localhost/api/auth/sync-user", {
      method: "POST",
      body: JSON.stringify({ first_name: "John", last_name: "Doe" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Authorization header is required");
  });

  it("skips sync silently when BACKEND_URL is not set", async () => {
    const request = new NextRequest("http://localhost/api/auth/sync-user", {
      method: "POST",
      headers: {
        Authorization: "Bearer mock-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ first_name: "John", last_name: "Doe" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true, synced: false });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("forwards Authorization, Content-Type, and body payload when BACKEND_URL is configured", async () => {
    process.env.BACKEND_URL = "https://backend.safetrust.test";

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ success: true, user_id: "user-123" }),
    });

    const payload = { first_name: "Jane", last_name: "Doe" };
    const request = new NextRequest("http://localhost/api/auth/sync-user", {
      method: "POST",
      headers: {
        Authorization: "Bearer id-token-xyz",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true, user_id: "user-123" });
    expect(global.fetch).toHaveBeenCalledWith(
      "https://backend.safetrust.test/api/auth/sync-user",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer id-token-xyz",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }),
    );
  });

  it("returns downstream backend error response and status", async () => {
    process.env.BACKEND_URL = "https://backend.safetrust.test";

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ error: "User already exists" }),
    });

    const request = new NextRequest("http://localhost/api/auth/sync-user", {
      method: "POST",
      headers: {
        Authorization: "Bearer id-token-xyz",
      },
      body: JSON.stringify({ first_name: "Jane" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("User already exists");
  });
});
