/** @jest-environment node */

import { POST } from "./route";

const VALID_ID = "123e4567-e89b-42d3-a456-426614174000";
const CLIENT_OP_ID = "123e4567-e89b-42d3-a456-426614174001";

const createRequest = (
  body: unknown,
  authorization = "Bearer firebase-token",
) =>
  new Request(`http://localhost/api/listings/${VALID_ID}/reports`, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

describe("POST /api/listings/[id]/reports", () => {
  const originalBackendUrl = process.env.BACKEND_URL;
  const originalDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE;
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BACKEND_URL = "https://backend.example/";
    delete process.env.NEXT_PUBLIC_DEMO_MODE;
    global.fetch = fetchMock;
  });

  afterAll(() => {
    process.env.BACKEND_URL = originalBackendUrl;
    process.env.NEXT_PUBLIC_DEMO_MODE = originalDemoMode;
    jest.restoreAllMocks();
  });

  it("forwards authenticated reports to the apartment endpoint", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ id: "report-1", status: "open" }, { status: 201 }),
    );
    const body = {
      category: "safety",
      details: "Broken lock",
      clientOpId: CLIENT_OP_ID,
      isAdmin: true,
    };

    const response = await POST(createRequest(body), {
      params: Promise.resolve({ id: VALID_ID }),
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      id: "report-1",
      status: "open",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `https://backend.example/api/apartments/${VALID_ID}/reports`,
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer firebase-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: body.category,
          details: body.details,
          clientOpId: body.clientOpId,
        }),
      }),
    );
  });

  it("returns unavailable for demo mode, missing backend, and fixture IDs", async () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = "true";
    const demoResponse = await POST(
      createRequest({
        category: "safety",
        clientOpId: CLIENT_OP_ID,
      }),
      { params: Promise.resolve({ id: VALID_ID }) },
    );
    expect(demoResponse.status).toBe(503);
    await expect(demoResponse.json()).resolves.toEqual({
      error: "BACKEND_NOT_CONFIGURED",
    });

    delete process.env.NEXT_PUBLIC_DEMO_MODE;
    delete process.env.BACKEND_URL;
    const noBackendResponse = await POST(
      createRequest({
        category: "safety",
        clientOpId: CLIENT_OP_ID,
      }),
      { params: Promise.resolve({ id: VALID_ID }) },
    );
    expect(noBackendResponse.status).toBe(503);

    process.env.BACKEND_URL = "https://backend.example";
    const fixtureResponse = await POST(
      createRequest({
        category: "safety",
        clientOpId: CLIENT_OP_ID,
      }),
      { params: Promise.resolve({ id: "1" }) },
    );
    expect(fixtureResponse.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("requires authentication and validates the report body", async () => {
    const unauthorized = await POST(
      createRequest(
        { category: "safety", clientOpId: CLIENT_OP_ID },
        "",
      ),
      { params: Promise.resolve({ id: VALID_ID }) },
    );
    expect(unauthorized.status).toBe(401);

    const invalid = await POST(
      createRequest({ category: "unknown", clientOpId: CLIENT_OP_ID }),
      { params: Promise.resolve({ id: VALID_ID }) },
    );
    expect(invalid.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
