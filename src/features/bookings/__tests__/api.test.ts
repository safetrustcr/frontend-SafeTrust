import { cancelBooking, listBookings, ApiError } from "../api";

jest.mock("@/lib/firebase", () => ({
  auth: {
    currentUser: { getIdToken: jest.fn().mockResolvedValue("tok") },
  },
}));

const reservation = {
  id: "res-1",
  status: "cancelled",
  checkIn: "2026-11-01T00:00:00.000Z",
  checkOut: "2026-11-05T00:00:00.000Z",
  amount: "450.00",
  asset: "USDC",
  apartment: { id: "a", name: "Condo" },
  contractId: null,
  party: "guest",
  allowedActions: ["view"],
};

const jsonResponse = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

describe("bookings api", () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("cancelBooking returns the mapped row on 200", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(jsonResponse(reservation));
    const row = await cancelBooking("res-1", "plans changed");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/bookings/res-1/cancel",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer tok" }),
        body: JSON.stringify({ reason: "plans changed" }),
      }),
    );
    expect(row.status).toBe("cancelled");
    expect(row.allowedActions).toEqual(["view"]);
  });

  it("cancelBooking throws ApiError with the backend code on 409", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(
        { error: "RESERVATION_NOT_CANCELLABLE", status: "funded" },
        409,
      ),
    );
    const err = await cancelBooking("res-1").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(409);
    expect(err.code).toBe("RESERVATION_NOT_CANCELLABLE");
  });

  it("cancelBooking throws ApiError with status 0 on a network error", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new TypeError("Failed"));
    const err = await cancelBooking("res-1").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(0);
  });

  it("listBookings maps the reservations list", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({ reservations: [reservation] }),
    );
    const rows = await listBookings();
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/bookings",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer tok" }),
      }),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe("res-1");
  });

  it("listBookings throws ApiError INVALID_RESPONSE on a non-JSON 200", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    });
    const err = await listBookings().catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe("INVALID_RESPONSE");
  });

  it("cancelBooking throws INVALID_RESPONSE on a 200 with the wrong shape", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(jsonResponse({}));
    const err = await cancelBooking("res-1").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe("INVALID_RESPONSE");
  });
});
