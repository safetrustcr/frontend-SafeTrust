import { ReportError, submitListingReport } from "./reports";

jest.mock("@/lib/firebase", () => ({
  auth: { currentUser: { getIdToken: jest.fn() } },
}));

import { auth } from "@/lib/firebase";
const mockAuth = auth as unknown as {
  currentUser: null | { getIdToken: jest.Mock };
};
const mockGetIdToken = mockAuth.currentUser?.getIdToken as jest.Mock;

const listingId = "123e4567-e89b-42d3-a456-426614174000";
const clientOpId = "123e4567-e89b-42d3-a456-426614174001";

describe("submitListingReport", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.currentUser = { getIdToken: mockGetIdToken };
    mockGetIdToken.mockResolvedValue("firebase-token");
    global.fetch = fetchMock;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("posts a categorized report with the authenticated token and operation ID", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: "report-1", status: "open" }),
    });

    await expect(
      submitListingReport(
        listingId,
        { category: "safety", details: " Broken lock " },
        clientOpId,
      ),
    ).resolves.toEqual({ id: "report-1", status: "open" });

    expect(fetchMock).toHaveBeenCalledWith(
      `/api/listings/${listingId}/reports`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer firebase-token",
        }),
        body: JSON.stringify({
          category: "safety",
          details: "Broken lock",
          clientOpId,
        }),
      }),
    );
  });

  it("rejects signed-out users without sending a request", async () => {
    mockAuth.currentUser = null;
    await expect(
      submitListingReport(listingId, { category: "safety" }, clientOpId),
    ).rejects.toMatchObject<Partial<ReportError>>({ code: "UNAUTHENTICATED" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not send fixture listing IDs to the backend", async () => {
    await expect(
      submitListingReport("1", { category: "safety" }, clientOpId),
    ).rejects.toMatchObject<Partial<ReportError>>({
      code: "BACKEND_NOT_CONFIGURED",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("surfaces backend error codes, rate limits, and network failures", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: "CANNOT_REPORT_OWN_LISTING" }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: "RATE_LIMITED" }),
      })
      .mockRejectedValueOnce(new TypeError("offline"));

    await expect(
      submitListingReport(listingId, { category: "safety" }, clientOpId),
    ).rejects.toMatchObject({ code: "CANNOT_REPORT_OWN_LISTING" });
    await expect(
      submitListingReport(listingId, { category: "safety" }, clientOpId),
    ).rejects.toMatchObject({ code: "429" });
    await expect(
      submitListingReport(listingId, { category: "safety" }, clientOpId),
    ).rejects.toThrow("offline");
  });
});
