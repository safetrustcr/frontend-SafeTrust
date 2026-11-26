import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { WalletSigningState } from "./WalletSigningState";

describe("WalletSigningState", () => {
  it("renders nothing when idle", () => {
    const { container } = render(<WalletSigningState status="idle" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders awaiting-signature with role=status", () => {
    const onCancel = jest.fn();
    render(
      <WalletSigningState
        status="awaiting-signature"
        actionTitle="Mark stay completed"
        onCancel={onCancel}
      />,
    );

    const statusElem = screen.getByRole("status");
    expect(statusElem).toBeInTheDocument();
    expect(screen.getByText("Confirm in your wallet")).toBeInTheDocument();
    expect(
      screen.getByText(/sign the mark stay completed request/i),
    ).toBeInTheDocument();

    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("renders submitting state with tx link", () => {
    render(
      <WalletSigningState status="submitting" txHash="0123456789abcdef" />,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Confirming on Stellar…")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /view transaction/i });
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("0123456789abcdef"),
    );
  });

  it("renders done state with confirmed title and onDone button", () => {
    const onDone = jest.fn();
    render(
      <WalletSigningState
        status="done"
        actionTitle="Release funds"
        txHash="fedcba9876543210"
        onDone={onDone}
      />,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Release funds confirmed")).toBeInTheDocument();
    const doneBtn = screen.getByRole("button", { name: /done/i });
    fireEvent.click(doneBtn);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("renders failed state with role=alert, error message and retry button", () => {
    const onRetry = jest.fn();
    const onCancel = jest.fn();
    render(
      <WalletSigningState
        status="failed"
        error="Simulation rejected by Soroban RPC"
        onRetry={onRetry}
        onCancel={onCancel}
      />,
    );

    const alertElem = screen.getByRole("alert");
    expect(alertElem).toBeInTheDocument();
    expect(screen.getByText("Transaction failed")).toBeInTheDocument();
    expect(
      screen.getByText("Simulation rejected by Soroban RPC"),
    ).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);

    const dismissBtn = screen.getByRole("button", { name: /dismiss/i });
    fireEvent.click(dismissBtn);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
