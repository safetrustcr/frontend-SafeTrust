import { renderHook } from "@testing-library/react";
import { useBookingEscrow } from "./useBookingEscrow";

const GUEST = "GAK6DAPPQDDPSQRXTLWD6SGCOYAXWYP7XKSQNMEIZW6TSW7GKVASZIAH";
const HOTEL = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

jest.mock("@/hooks/useWallet", () => ({
  useWallet: () => ({ address: GUEST }),
}));

let mockNoUsdc = false;
jest.mock("@/lib/stellar/assets", () => {
  const actual = jest.requireActual("@/lib/stellar/assets");
  return {
    ...actual,
    usdcFor: (...args: Parameters<typeof actual.usdcFor>) =>
      mockNoUsdc ? null : actual.usdcFor(...args),
  };
});

const render = () =>
  renderHook(() =>
    useBookingEscrow({
      bookingData: {
        id: "booking-1",
        roomId: "room-1",
        hotelId: "hotel-1",
        totalAmount: 100,
        currency: "USD",
        checkInDate: "2030-01-10",
        checkOutDate: "2030-01-12",
        guestEmail: "guest@example.com",
      },
      hotelData: { id: "hotel-1", name: "Hotel", walletAddress: HOTEL },
      escrowType: "single_release",
    }),
  );

describe("legacy useBookingEscrow trustline", () => {
  beforeEach(() => {
    mockNoUsdc = false;
  });

  it("uses the active network's USDC issuer", () => {
    const { result } = render();
    expect(result.current.isValid).toBe(true);
    expect(result.current.escrowFormData.trustline.address).toBe(
      "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    );
  });

  it("blocks the form before any wallet prompt when USDC is missing", () => {
    mockNoUsdc = true;
    const { result } = render();
    expect(result.current.isValid).toBe(false);
    expect(result.current.validationErrors).toContain(
      "USDC isn't configured for testnet. Contact support.",
    );
    expect(result.current.escrowFormData.trustline.address).toBe("");
  });
});
