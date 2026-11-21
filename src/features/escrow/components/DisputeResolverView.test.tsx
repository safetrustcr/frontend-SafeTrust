import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DisputeResolverView } from "./DisputeResolverView";

describe("DisputeResolverView", () => {
  const defaultProps = {
    totalBalance: 4000,
    currency: "USDC",
    disputeDetails: {
      reason: "Property not as described",
      description: "Listing showed ocean view but view was blocked.",
      openedBy: "Guest",
      openedAt: "2025-02-12",
    },
    onResolve: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders total balance and dispute details", () => {
    render(<DisputeResolverView {...defaultProps} />);

    expect(screen.getByText("Dispute Resolution Panel")).toBeInTheDocument();
    expect(screen.getByText("4,000 USDC")).toBeInTheDocument();
    expect(
      screen.getByText("Reason: Property not as described"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/"Listing showed ocean view but view was blocked."/),
    ).toBeInTheDocument();
  });

  it("validates that submit is enabled when initial split is 50/50 (sums to 4000)", () => {
    render(<DisputeResolverView {...defaultProps} />);

    const submitBtn = screen.getByRole("button", {
      name: /resolve dispute and execute split/i,
    });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);
    expect(defaultProps.onResolve).toHaveBeenCalledWith({
      guestAmount: 2000,
      hostAmount: 2000,
      resolverNotes: undefined,
    });
  });

  it("disables submit and shows error when amounts do not sum to totalBalance", () => {
    render(<DisputeResolverView {...defaultProps} />);

    const guestInput = screen.getByLabelText(/guest refund/i);
    fireEvent.change(guestInput, { target: { value: "1000" } });

    // Sum is now 1000 + 2000 = 3000 !== 4000
    const submitBtn = screen.getByRole("button", {
      name: /resolve dispute and execute split/i,
    });
    expect(submitBtn).toBeDisabled();

    expect(
      screen.getByText(
        /Split totals 3000.00, which is 1000.00 under the balance of 4000.00/i,
      ),
    ).toBeInTheDocument();
  });

  it("updates inputs when clicking presets", () => {
    render(<DisputeResolverView {...defaultProps} />);

    const fullGuestBtn = screen.getByRole("button", {
      name: /100% guest \/ 0% host/i,
    });
    fireEvent.click(fullGuestBtn);

    const guestInput = screen.getByLabelText(
      /guest refund/i,
    ) as HTMLInputElement;
    const hostInput = screen.getByLabelText(/host payout/i) as HTMLInputElement;
    expect(guestInput.value).toBe("4000.00");
    expect(hostInput.value).toBe("0.00");

    const submitBtn = screen.getByRole("button", {
      name: /resolve dispute and execute split/i,
    });
    expect(submitBtn).not.toBeDisabled();
  });

  it("auto-balances remaining amount when auto-balance is clicked", () => {
    render(<DisputeResolverView {...defaultProps} />);

    const guestInput = screen.getByLabelText(/guest refund/i);
    fireEvent.change(guestInput, { target: { value: "1500" } });

    const autoBalanceHostBtn = screen.getAllByRole("button", {
      name: /auto-balance/i,
    })[1];
    fireEvent.click(autoBalanceHostBtn);

    const hostInput = screen.getByLabelText(/host payout/i) as HTMLInputElement;
    expect(hostInput.value).toBe("2500.00");

    const submitBtn = screen.getByRole("button", {
      name: /resolve dispute and execute split/i,
    });
    expect(submitBtn).not.toBeDisabled();
  });
});
