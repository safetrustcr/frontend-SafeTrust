import * as React from "react";
import { render, screen } from "@testing-library/react";
import EscrowLifecycleDemoPage from "./page";

describe("EscrowLifecycleDemoPage", () => {
  it("renders the lifecycle demo page with back link", () => {
    render(<EscrowLifecycleDemoPage />);

    expect(
      screen.getByRole("link", { name: /back to escrows/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Escrow Lifecycle Interactive Testbench"),
    ).toBeInTheDocument();
  });
});
