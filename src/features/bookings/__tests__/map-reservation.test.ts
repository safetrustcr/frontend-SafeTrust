import { mapReservation, type ReservationDto } from "../map-reservation";

const dto = (over: Partial<ReservationDto> = {}): ReservationDto => ({
  id: "res-1",
  status: "pending",
  checkIn: "2026-11-01T00:00:00.000Z",
  checkOut: "2026-11-05T00:00:00.000Z",
  amount: "450.00",
  asset: "USDC",
  apartment: { id: "apt-1", name: "Oceanfront Condo" },
  contractId: null,
  party: "guest",
  allowedActions: ["view", "cancel"],
  ...over,
});

describe("mapReservation", () => {
  it.each([
    ["pending", "pending"],
    ["escrow_created", "pending"],
    ["funded", "funded"],
    ["checked_in", "check_in_approved"],
    ["checked_out", "check_out_approved"],
    ["completed", "completed"],
    ["disputed", "funded"],
    ["resolved", "completed"],
    ["cancelled", "cancelled"],
  ] as const)("maps reservation status %s to %s", (status, expected) => {
    expect(mapReservation(dto({ status })).status).toBe(expected);
  });

  it("copies allowedActions and identifiers", () => {
    const row = mapReservation(
      dto({ contractId: "CABC", allowedActions: ["view", "view_contract"] }),
    );
    expect(row.allowedActions).toEqual(["view", "view_contract"]);
    expect(row.id).toBe("res-1");
    expect(row.contractId).toBe("CABC");
    expect(row.metadata?.bookingId).toBe("res-1");
    expect(row.metadata?.hotelName).toBe("Oceanfront Condo");
    expect(row.metadata?.checkInDate).toBe("2026-11-01T00:00:00.000Z");
    expect(row.amount).toBe(450);
    expect(row.asset.code).toBe("USDC");
  });

  it("uses an empty contractId when no contract exists", () => {
    expect(mapReservation(dto()).contractId).toBe("");
  });
});
