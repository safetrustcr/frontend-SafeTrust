import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { RentBooking } from "./RentBooking";
import type { ApartmentListing } from "@/types/hotel";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/hooks/useWallet", () => ({
  useWallet: () => ({ address: null, connect: jest.fn() }),
}));

jest.mock("./BookingEscrowCheckout", () => ({
  BookingEscrowCheckout: ({
    onFunded,
    booking,
  }: {
    onFunded?: (intent: {
      state: { step: "funded"; contractId: string };
    }) => void;
    booking: {
      price: { nightlyRate: number; nights: number; subtotal: number };
    } | null;
  }) => (
    <>
      <div data-testid="booking-price">
        {booking
          ? `${booking.price.nightlyRate}|${booking.price.nights}|${booking.price.subtotal}`
          : "no booking"}
      </div>
      <button
        onClick={() =>
          onFunded?.({
            state: { step: "funded", contractId: "C-123" },
          })
        }
      >
        Complete funding
      </button>
    </>
  ),
}));

jest.mock("@/providers/EscrowProviders", () => ({
  EscrowProviders: ({ children }: { children: ReactNode }) => children,
}));

const listing: ApartmentListing = {
  id: "apt-42",
  name: "Central apartment",
  address: "San José",
  coordinates: { lat: 9.93, lng: -84.08 },
  price: 1200,
  promoted: false,
  images: [],
  category: "Travelers",
  location: "San José",
  owner: { name: "Host", avatar: "" },
  description: "",
  rating: 4.5,
  bedrooms: 1,
  bathrooms: 1,
  petFriendly: false,
};

beforeEach(() => mockPush.mockClear());

it("navigates to the rental escrow after funding", () => {
  render(<RentBooking listing={listing} />);

  fireEvent.click(screen.getByRole("button", { name: "Complete funding" }));

  expect(mockPush).toHaveBeenCalledWith("/rent/apt-42/escrow/C-123");
});

it("links back to the rentals list", () => {
  render(<RentBooking listing={listing} />);

  expect(screen.getByRole("link", { name: "Back to rentals" })).toHaveAttribute(
    "href",
    "/rent",
  );
});

it("charges the listing nightly rate for every stay night", () => {
  render(
    <RentBooking
      listing={listing}
      initialCheckIn="2026-11-01"
      initialCheckOut="2026-11-06"
    />,
  );

  expect(screen.getByTestId("booking-price")).toHaveTextContent("1200|5|6000");
});

it("ignores invalid or reversed initial stay dates", () => {
  render(
    <RentBooking
      listing={listing}
      initialCheckIn="2026-11-06"
      initialCheckOut="2026-11-01"
    />,
  );

  expect(screen.getByTestId("booking-price")).toHaveTextContent("no booking");
});
