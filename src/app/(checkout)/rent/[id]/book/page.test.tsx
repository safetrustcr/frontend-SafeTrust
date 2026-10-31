import { render, screen } from "@testing-library/react";
import RentBookPage from "./page";

jest.mock("@/features/escrow", () => ({
  RentBooking: ({
    initialCheckIn,
    initialCheckOut,
    initialGuestCount,
  }: {
    initialCheckIn?: string;
    initialCheckOut?: string;
    initialGuestCount?: number;
  }) => (
    <div data-testid="booking-query">
      {initialCheckIn ?? "no check-in"}|{initialCheckOut ?? "no check-out"}|
      {initialGuestCount ?? "no guests"}
    </div>
  ),
}));

const params = Promise.resolve({ id: "1" });

describe("RentBookPage query values", () => {
  it("passes single date and guest values to the booking", async () => {
    const page = await RentBookPage({
      params,
      searchParams: Promise.resolve({
        checkIn: "2030-01-10",
        checkOut: "2030-01-12",
        adults: "2",
      }),
    });

    render(page);
    expect(screen.getByTestId("booking-query")).toHaveTextContent(
      "2030-01-10|2030-01-12|2",
    );
  });

  it("ignores repeated parameters instead of passing arrays to the picker", async () => {
    const page = await RentBookPage({
      params,
      searchParams: Promise.resolve({
        checkIn: ["2030-01-10", "2030-01-11"],
        checkOut: ["2030-01-12", "2030-01-13"],
        adults: ["2", "3"],
      }),
    });

    render(page);
    expect(screen.getByTestId("booking-query")).toHaveTextContent(
      "no check-in|no check-out|no guests",
    );
  });
});
