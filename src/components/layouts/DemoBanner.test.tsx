import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { DemoBanner } from "./DemoBanner";

// Mutable so each test can pick the network. `mock*`-prefixed because
// jest.mock factories may only reference those names.
const mockEnv = {
  demoMode: "true",
  network: "testnet" as "testnet" | "mainnet",
};

jest.mock("@/config/env", () => ({
  clientEnv: {
    get NEXT_PUBLIC_DEMO_MODE() {
      return mockEnv.demoMode;
    },
    get NEXT_PUBLIC_TRUSTLESS_NETWORK() {
      return mockEnv.network;
    },
  },
}));

beforeEach(() => {
  mockEnv.demoMode = "true";
  mockEnv.network = "testnet";
});

describe("DemoBanner", () => {
  it("renders nothing outside demo mode", () => {
    mockEnv.demoMode = "false";
    render(<DemoBanner />);

    expect(screen.queryByRole("note")).not.toBeInTheDocument();
  });

  it("names testnet and says it is test money only", () => {
    render(<DemoBanner />);

    const banner = screen.getByRole("note");
    expect(banner).toHaveTextContent(/Stellar\s+testnet/);
    expect(banner).toHaveTextContent(/test money only/);
    expect(banner).not.toHaveTextContent(/mainnet/);
  });

  it("names mainnet and warns that real USDC moves", () => {
    mockEnv.network = "mainnet";
    render(<DemoBanner />);

    const banner = screen.getByRole("note");
    expect(banner).toHaveTextContent(/Stellar\s+mainnet/);
    expect(banner).toHaveTextContent(/real\s+USDC/);
    expect(banner).not.toHaveTextContent(/testnet/);
  });
});
