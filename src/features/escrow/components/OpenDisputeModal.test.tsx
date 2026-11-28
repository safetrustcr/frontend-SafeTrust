import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { OpenDisputeModal } from "./OpenDisputeModal";

describe("OpenDisputeModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders when open", () => {
    render(<OpenDisputeModal {...defaultProps} />);

    expect(
      screen.getByRole("heading", { name: "Open a Dispute" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/dispute reason/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/description & evidence/i),
    ).toBeInTheDocument();
  });

  it("shows error if submitted without a reason", () => {
    render(<OpenDisputeModal {...defaultProps} />);

    const submitBtn = screen.getByRole("button", {
      name: /confirm and open dispute/i,
    });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText("Please select a reason for the dispute."),
    ).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it("submits valid reason and description", () => {
    render(<OpenDisputeModal {...defaultProps} />);

    const reasonSelect = screen.getByLabelText(/dispute reason/i);
    fireEvent.change(reasonSelect, {
      target: { value: "property_not_as_described" },
    });

    const descTextarea = screen.getByLabelText(/description & evidence/i);
    fireEvent.change(descTextarea, {
      target: { value: "Air conditioning was completely broken." },
    });

    const submitBtn = screen.getByRole("button", {
      name: /confirm and open dispute/i,
    });
    fireEvent.click(submitBtn);

    expect(defaultProps.onSubmit).toHaveBeenCalledWith({
      reason: "property_not_as_described",
      description: "Air conditioning was completely broken.",
    });
  });

  it("calls onClose when cancel is clicked", () => {
    render(<OpenDisputeModal {...defaultProps} />);

    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
