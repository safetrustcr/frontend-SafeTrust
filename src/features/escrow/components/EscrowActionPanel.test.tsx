import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EscrowActionPanel } from "./EscrowActionPanel";

describe("EscrowActionPanel", () => {
  const baseProps = {
    escrowId: "escrow-test-1",
    amount: 4000,
    currency: "USDC",
    checkOutDate: "2025-01-01", // Past date
    hostAddress: "GBHOSTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    guestAddress: "GBGUESTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  };

  it("renders host mark stay completed form when checkout date has passed", () => {
    const onMarkCompleted = jest.fn();
    render(
      <EscrowActionPanel
        {...baseProps}
        status="funded"
        role="host"
        onMarkStayCompleted={onMarkCompleted}
      />,
    );

    expect(screen.getByText("Conclude Stay")).toBeInTheDocument();
    const noteInput = screen.getByLabelText(/completion note/i);
    fireEvent.change(noteInput, { target: { value: "Everything in order" } });

    const btn = screen.getByRole("button", { name: /mark stay completed/i });
    fireEvent.click(btn);
    expect(onMarkCompleted).toHaveBeenCalledWith("Everything in order");
  });

  it("shows read-only stay in progress for host if checkout date is in the future", () => {
    render(
      <EscrowActionPanel
        {...baseProps}
        status="funded"
        role="host"
        checkOutDate="2099-01-01"
      />,
    );

    expect(screen.getByText("Stay In Progress")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /mark stay completed/i }),
    ).not.toBeInTheDocument();
  });

  it("renders guest actions in stay_completed under Option B (Approve and Release)", () => {
    const onApproveAndRelease = jest.fn();
    const onOpenDispute = jest.fn();

    render(
      <EscrowActionPanel
        {...baseProps}
        status="stay_completed"
        role="guest"
        releaseOption="guest"
        onApproveAndRelease={onApproveAndRelease}
        onOpenDispute={onOpenDispute}
      />,
    );

    expect(screen.getByText("Stay Completed by Host")).toBeInTheDocument();
    const approveBtn = screen.getByRole("button", {
      name: /approve and release/i,
    });
    const disputeBtn = screen.getByRole("button", { name: /open dispute/i });
    expect(approveBtn).toBeInTheDocument();
    expect(disputeBtn).toBeInTheDocument();

    // Clicking Approve and Release opens confirmation dialog
    fireEvent.click(approveBtn);
    expect(screen.getByText("Approve and Release Funds?")).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", {
      name: /confirm and release/i,
    });
    fireEvent.click(confirmBtn);
    expect(onApproveAndRelease).toHaveBeenCalledTimes(1);
  });

  it("renders guest actions in stay_completed under Option A (Approve Stay)", () => {
    const onApproveStay = jest.fn();

    render(
      <EscrowActionPanel
        {...baseProps}
        status="stay_completed"
        role="guest"
        releaseOption="platform"
        onApproveStay={onApproveStay}
      />,
    );

    const approveStayBtn = screen.getByRole("button", {
      name: /approve stay/i,
    });
    expect(approveStayBtn).toBeInTheDocument();

    fireEvent.click(approveStayBtn);
    expect(onApproveStay).toHaveBeenCalledTimes(1);
  });

  it("renders guest approved status in Option A", () => {
    render(
      <EscrowActionPanel
        {...baseProps}
        status="approved"
        role="guest"
        releaseOption="platform"
      />,
    );

    expect(
      screen.getByText("Approved, release in progress"),
    ).toBeInTheDocument();
  });

  it("renders platform release action in Option A when role is platform", () => {
    const onReleaseFunds = jest.fn();
    render(
      <EscrowActionPanel
        {...baseProps}
        status="approved"
        role="platform"
        releaseOption="platform"
        onReleaseFunds={onReleaseFunds}
      />,
    );

    expect(screen.getByText("Platform Release Action")).toBeInTheDocument();
    const releaseBtn = screen.getByRole("button", {
      name: /release funds to host/i,
    });
    fireEvent.click(releaseBtn);
    expect(onReleaseFunds).toHaveBeenCalledTimes(1);
  });

  it("renders dispute resolver view when role is resolver and status is disputed", () => {
    const onResolveDispute = jest.fn();
    render(
      <EscrowActionPanel
        {...baseProps}
        status="disputed"
        role="resolver"
        onResolveDispute={onResolveDispute}
      />,
    );

    expect(screen.getByText("Dispute Resolution Panel")).toBeInTheDocument();
  });

  it("renders read-only dispute status for host or guest", () => {
    render(
      <EscrowActionPanel
        {...baseProps}
        status="disputed"
        role="host"
        disputeDetails={{
          reason: "Damaged amenities",
          description: "Broken chair",
          openedBy: "Guest",
          openedAt: "2025-02-12",
        }}
      />,
    );

    expect(screen.getByText("Escrow Disputed")).toBeInTheDocument();
    expect(screen.getByText("Claim: Damaged amenities")).toBeInTheDocument();
  });

  it("renders wallet signing state when signingStatus is not idle", () => {
    render(
      <EscrowActionPanel
        {...baseProps}
        status="stay_completed"
        role="guest"
        signingStatus="awaiting-signature"
      />,
    );

    expect(screen.getByText("Confirm in your wallet")).toBeInTheDocument();
  });
});
