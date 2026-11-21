import * as React from "react";
import { render, screen } from "@testing-library/react";
import { ProcessStepper } from "./ProcessStepper";

describe("ProcessStepper", () => {
  it("renders standard lifecycle steps with numerical currentStep", () => {
    render(<ProcessStepper currentStep={2} />);

    expect(screen.getByText("Escrow Timeline")).toBeInTheDocument();
    expect(screen.getByText("Escrow created")).toBeInTheDocument();
    expect(screen.getByText("Payment locked")).toBeInTheDocument();
    expect(screen.getByText("Stay completed")).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getByText("Released")).toBeInTheDocument();

    // Payment locked is active step 2
    const currentStep = screen.getByRole("listitem", { current: "step" });
    expect(currentStep).toHaveTextContent("Payment locked");
  });

  it("marks stay_completed as current step with aria-current", () => {
    render(<ProcessStepper status="stay_completed" />);

    const currentStep = screen.getByRole("listitem", { current: "step" });
    expect(currentStep).toHaveTextContent("Stay completed");
  });

  it("renders step details: actor, date, and transaction link", () => {
    render(
      <ProcessStepper
        status="funded"
        stepDetails={{
          created: {
            date: "2025-02-01",
            actor: "Guest created the escrow",
            txHash: "abcd1234ef567890",
          },
          funded: {
            date: "2025-02-02",
            actor: "Guest deposited 4,000 USDC",
          },
        }}
      />,
    );

    expect(screen.getByText("Guest created the escrow")).toBeInTheDocument();
    expect(screen.getByText("Guest deposited 4,000 USDC")).toBeInTheDocument();
    expect(screen.getByText("2025-02-01")).toBeInTheDocument();

    const txLink = screen.getByRole("link", { name: /tx: abcd1234…/i });
    expect(txLink).toHaveAttribute(
      "href",
      expect.stringContaining("abcd1234ef567890"),
    );
  });

  it("renders dispute side branch when status is disputed", () => {
    render(
      <ProcessStepper
        status="disputed"
        stepDetails={{
          disputed: {
            actor: "Guest opened a dispute",
            date: "2025-02-12",
          },
        }}
      />,
    );

    expect(screen.getByText("Dispute Flow")).toBeInTheDocument();
    expect(screen.getByText("Disputed")).toBeInTheDocument();
    expect(screen.getByText("Resolved")).toBeInTheDocument();
    expect(screen.getByText("Guest opened a dispute")).toBeInTheDocument();

    const currentStep = screen.getByRole("listitem", { current: "step" });
    expect(currentStep).toHaveTextContent("Disputed");
  });

  it("renders resolved state as current when status is resolved", () => {
    render(<ProcessStepper status="resolved" />);

    const currentStep = screen.getByRole("listitem", { current: "step" });
    expect(currentStep).toHaveTextContent("Resolved");
  });
});
