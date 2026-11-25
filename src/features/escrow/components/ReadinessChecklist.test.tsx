import { fireEvent, render, screen, within } from "@testing-library/react";
import { ReadinessChecklist } from "./ReadinessChecklist";
import {
  demoCheckoutReadiness,
  summarizeReadiness,
  type CheckoutReadiness,
} from "../model/readiness";

const ready = { status: "ready" } as const;
const allReady: CheckoutReadiness = {
  guest: ready,
  host: ready,
  platform: ready,
};

const checklist = () => screen.getByTestId("readiness-checklist");
const item = (key: string) => screen.getByTestId(`readiness-${key}`);

describe("ReadinessChecklist", () => {
  it("checking: shows a skeleton with every label and no retry", () => {
    render(
      <ReadinessChecklist
        readiness={demoCheckoutReadiness("checking", 199.83)}
        onRetry={jest.fn()}
      />,
    );

    expect(checklist()).toHaveAttribute("data-readiness", "checking");
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(status).toHaveTextContent("Checking wallets…");
    expect(within(status).getByText("Your wallet")).toBeInTheDocument();
    expect(
      within(status).getByText("Host can receive USDC"),
    ).toBeInTheDocument();
    expect(
      within(status).getByText("Platform can receive fees"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Check again/ }),
    ).not.toBeInTheDocument();
  });

  it("ready: every item says why it passes, in text", () => {
    render(<ReadinessChecklist readiness={allReady} onRetry={jest.fn()} />);

    expect(checklist()).toHaveAttribute("data-readiness", "ready");
    expect(item("guest")).toHaveTextContent(
      "Ready: Your walletUSDC trustline added and enough USDC to pay.",
    );
    expect(item("host")).toHaveTextContent(
      "The host's wallet can receive USDC.",
    );
    expect(item("platform")).toHaveTextContent(
      "SafeTrust's fee wallet can receive USDC.",
    );
    expect(
      screen.queryByRole("button", { name: /Check again/ }),
    ).not.toBeInTheDocument();
  });

  it("not ready (guest balance): states how much is needed and held", () => {
    render(
      <ReadinessChecklist
        readiness={demoCheckoutReadiness("guest-low-balance", 199.83)}
      />,
    );

    expect(checklist()).toHaveAttribute("data-readiness", "not-ready");
    expect(item("guest")).toHaveAttribute(
      "data-status",
      "insufficient-balance",
    );
    expect(item("guest")).toHaveTextContent(
      "You need $199.83 USDC, you have $50.00.",
    );
    expect(screen.getByText("Add USDC to your wallet")).toBeInTheDocument();
  });

  it("not ready (guest trustline): shows the trustline steps", () => {
    render(
      <ReadinessChecklist
        readiness={demoCheckoutReadiness("guest-no-trustline", 10)}
        onRetry={jest.fn()}
      />,
    );

    expect(item("guest")).toHaveTextContent(
      "Not ready: Your walletYour wallet has no USDC trustline yet.",
    );
    expect(
      screen.getByText("Add a USDC trustline in your wallet"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Approve the trustline/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Check again/ }),
    ).toBeInTheDocument();
  });

  it("not ready (host): flags the host before the guest signs", () => {
    render(
      <ReadinessChecklist
        readiness={demoCheckoutReadiness("host-not-ready", 10)}
      />,
    );

    expect(item("host")).toHaveAttribute("data-status", "no-trustline");
    expect(item("host")).toHaveTextContent(
      "The host hasn't added a USDC trustline, so they can't be paid yet.",
    );
    // Host problems are not the guest's to fix: no guest trustline steps.
    expect(
      screen.queryByText("Add a USDC trustline in your wallet"),
    ).not.toBeInTheDocument();
  });

  it("not ready (platform): explains the fee wallet can't receive", () => {
    render(
      <ReadinessChecklist
        readiness={{ ...allReady, platform: { status: "no-trustline" } }}
      />,
    );

    expect(item("platform")).toHaveTextContent(
      "SafeTrust's fee wallet can't receive USDC right now.",
    );
  });

  it("couldn't check: explains and offers a retry", () => {
    const onRetry = jest.fn();
    render(
      <ReadinessChecklist
        readiness={demoCheckoutReadiness("error", 10)}
        onRetry={onRetry}
      />,
    );

    expect(checklist()).toHaveAttribute("data-readiness", "error");
    expect(item("host")).toHaveTextContent(
      "Couldn't check: Host can receive USDCWe couldn't check this. Try again.",
    );
    fireEvent.click(screen.getByRole("button", { name: /Check again/ }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("summarizeReadiness", () => {
  it("prefers a definite failure over an unknown or pending check", () => {
    expect(
      summarizeReadiness({
        guest: { status: "checking" },
        host: { status: "error" },
        platform: { status: "no-trustline" },
      }),
    ).toBe("not-ready");
    expect(
      summarizeReadiness({
        guest: { status: "checking" },
        host: { status: "error" },
        platform: ready,
      }),
    ).toBe("error");
    expect(
      summarizeReadiness({ ...allReady, guest: { status: "checking" } }),
    ).toBe("checking");
    expect(summarizeReadiness(allReady)).toBe("ready");
  });
});
