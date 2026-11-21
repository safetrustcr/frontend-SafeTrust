import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { NetworkChip } from "./NetworkChip";

describe("NetworkChip", () => {
  it("labels testnet with text rather than colour alone", () => {
    render(<NetworkChip network="testnet" />);

    const chip = screen.getByTestId("network-chip");
    expect(chip).toHaveTextContent("Testnet");
    expect(chip).toHaveTextContent(/^Testnet$/);
    expect(chip).toHaveAttribute("data-network", "testnet");
  });

  it("labels mainnet with text rather than colour alone", () => {
    render(<NetworkChip network="mainnet" />);

    const chip = screen.getByTestId("network-chip");
    expect(chip).toHaveTextContent(/^Mainnet$/);
    expect(chip).toHaveAttribute("data-network", "mainnet");
  });

  it("falls back to the effective network from config", () => {
    // Jest sets NODE_ENV=test, so the config default is testnet.
    render(<NetworkChip />);

    expect(screen.getByTestId("network-chip")).toHaveTextContent("Testnet");
  });
});
