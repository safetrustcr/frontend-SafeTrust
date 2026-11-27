import { fireEvent, render, screen } from "@testing-library/react";
import {
  HostPayoutReadinessBanner,
  NotReadyForBookingsBadge,
} from "./HostPayoutReadinessBanner";

const banner = () => screen.getByTestId("host-payout-banner");

describe("HostPayoutReadinessBanner", () => {
  it("renders nothing while the status is unknown", () => {
    const { container } = render(
      <HostPayoutReadinessBanner status="unknown" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("checking: shows a busy skeleton", () => {
    render(<HostPayoutReadinessBanner status="checking" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(banner()).toHaveTextContent("Checking your payout wallet…");
  });

  it("not ready: tells the host to add a USDC trustline, with steps", () => {
    render(<HostPayoutReadinessBanner status="not-ready" />);
    expect(
      screen.getByRole("heading", {
        name: "Add a USDC trustline to receive payouts",
      }),
    ).toBeInTheDocument();
    expect(banner()).toHaveTextContent("Not ready for bookings");
    expect(screen.getByText(/Approve the trustline/)).toBeInTheDocument();
  });

  it("ready: confirms in text, not only colour", () => {
    render(<HostPayoutReadinessBanner status="ready" />);
    expect(banner()).toHaveTextContent("Your wallet can receive USDC payouts.");
  });

  it("couldn't check: offers a retry", () => {
    const onRetry = jest.fn();
    render(<HostPayoutReadinessBanner status="error" onRetry={onRetry} />);
    expect(banner()).toHaveTextContent("We couldn't check your payout wallet");
    fireEvent.click(screen.getByRole("button", { name: /Check again/ }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

it("NotReadyForBookingsBadge reads 'Not ready for bookings'", () => {
  render(<NotReadyForBookingsBadge />);
  expect(screen.getByTestId("not-ready-for-bookings")).toHaveTextContent(
    "Not ready for bookings",
  );
});
