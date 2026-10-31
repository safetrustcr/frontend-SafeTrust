import { fireEvent, render, screen } from "@testing-library/react";
import { MobileBookingBar } from "./MobileBookingBar";

describe("MobileBookingBar", () => {
  it("renders the sticky bar with nightly price and Reserve button", () => {
    render(
      <MobileBookingBar nightlyRate={2} open={false} onOpenChange={jest.fn()}>
        <div>Sheet Content</div>
      </MobileBookingBar>,
    );

    const bar = screen.getByTestId("mobile-booking-bar");
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveTextContent(/2/);
    expect(bar).toHaveTextContent(/\/ night/);

    const reserveButton = screen.getByRole("button", { name: "Reserve" });
    expect(reserveButton).toBeInTheDocument();
    expect(reserveButton).toHaveClass("min-h-11");
  });

  it("calls onOpenChange when Reserve is clicked", () => {
    const onOpenChange = jest.fn();
    render(
      <MobileBookingBar
        nightlyRate={2}
        open={false}
        onOpenChange={onOpenChange}
      >
        <div>Sheet Content</div>
      </MobileBookingBar>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Reserve" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("renders drawer title and content when open", () => {
    render(
      <MobileBookingBar nightlyRate={2} open={true} onOpenChange={jest.fn()}>
        <div data-testid="test-booking-card">Real Booking Card</div>
      </MobileBookingBar>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Book your stay" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("test-booking-card")).toBeInTheDocument();
  });
});
