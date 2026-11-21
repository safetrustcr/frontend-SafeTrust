import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EscrowLifecycleDemo } from "./EscrowLifecycleDemo";

describe("EscrowLifecycleDemo", () => {
  it("renders the interactive testbench with controls and timeline", () => {
    render(<EscrowLifecycleDemo />);

    expect(
      screen.getByText("Escrow Lifecycle Interactive Testbench"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/select lifecycle state/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Escrow Timeline")).toBeInTheDocument();
  });

  it("switches roles and updates available action panels", () => {
    render(<EscrowLifecycleDemo />);

    // Default is stay_completed with Guest role: shows "Approve and Release"
    expect(
      screen.getByRole("button", { name: /approve and release/i }),
    ).toBeInTheDocument();

    // Switch to Host role
    const hostRoleBtn = screen.getByRole("button", { name: /host/i });
    fireEvent.click(hostRoleBtn);

    // Host sees read-only status in stay_completed state
    expect(
      screen.getByText(
        "You marked this stay completed. Waiting for guest review and approval.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /approve and release/i }),
    ).not.toBeInTheDocument();
  });

  it("switches to Option A platform release", () => {
    render(<EscrowLifecycleDemo />);

    const optionABtn = screen.getByRole("button", {
      name: /option a \(platform release\)/i,
    });
    fireEvent.click(optionABtn);

    // Guest in Option A sees "Approve Stay"
    expect(
      screen.getByRole("button", { name: /approve stay/i }),
    ).toBeInTheDocument();
  });

  it("simulates signing state changes from controls", () => {
    render(<EscrowLifecycleDemo />);

    const awaitingBtn = screen.getByRole("button", {
      name: /awaiting signature/i,
    });
    fireEvent.click(awaitingBtn);

    expect(screen.getByText("Confirm in your wallet")).toBeInTheDocument();

    const failedBtn = screen.getByRole("button", { name: /failed/i });
    fireEvent.click(failedBtn);

    expect(screen.getByText("Transaction failed")).toBeInTheDocument();
  });
});
