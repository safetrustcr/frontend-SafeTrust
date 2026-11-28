import "@testing-library/jest-dom";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { EscrowStatusView } from "@/features/escrow";

jest.mock("next/navigation", () => ({
  useParams: jest.fn(() => ({ id: "1", escrowId: "test-escrow" })),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
  })),
}));

describe("EscrowStatusView", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders loading skeleton initially when initialData is undefined", () => {
    render(<EscrowStatusView rentalId="1" escrowId="test-escrow" />);
    expect(screen.getByRole("main")).toHaveAttribute("aria-busy", "true");
  });

  it("renders summary, timeline, parties and links after loading", async () => {
    render(<EscrowStatusView rentalId="1" escrowId="test-escrow" />);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(screen.getByText("La Sabana Luxury Apartment")).toBeInTheDocument();
    expect(screen.getByText("Dec 1 - Dec 5, 2026")).toBeInTheDocument();
    expect(screen.getByText("2 guests")).toBeInTheDocument();
    expect(screen.getByText("$850")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();

    // Timeline
    expect(screen.getByText("Escrow Lifecycle")).toBeInTheDocument();
    expect(screen.getByText("Escrow created")).toBeInTheDocument();
    expect(screen.getByText("Payment locked")).toBeInTheDocument();
    expect(screen.getByText("Stay active")).toBeInTheDocument();
    expect(screen.getByText("Payout released")).toBeInTheDocument();

    // Parties
    expect(screen.getByText("Guest, funded the escrow")).toBeInTheDocument();
    expect(screen.getByText("Host, receives the payout")).toBeInTheDocument();
    expect(
      screen.getByText("Platform, verifies completion & dispute resolver"),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Copy" })).toHaveLength(3);

    // Links
    expect(
      screen.getByRole("link", { name: /view on stellar expert/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /refresh/i }),
    ).toBeInTheDocument();
  });

  it("resolves demo escrow data by escrowId from demo bookings fixture", () => {
    render(
      <EscrowStatusView
        rentalId="2"
        escrowId="CB4D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCCZ"
      />,
    );

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(screen.getByText("Casa Verde Downtown")).toBeInTheDocument();
    expect(screen.getByText("$620")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(
      screen.getByText("Host (Maria Rodriguez), receives the payout"),
    ).toBeInTheDocument();
  });

  it("exposes lifecycle state to assistive technology with aria-current and screen-reader labels", () => {
    render(<EscrowStatusView rentalId="1" escrowId="test-escrow" />);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Step 2 is active for test-escrow
    const currentStepRow = screen
      .getByText("Payment locked")
      .closest("[aria-current='step']");
    expect(currentStepRow).toBeInTheDocument();
    expect(currentStepRow).toHaveAttribute("aria-current", "step");

    // Accessible text for status
    expect(screen.getByText("Completed:")).toBeInTheDocument();
    expect(screen.getByText("Current step:")).toBeInTheDocument();
    expect(screen.getAllByText("Upcoming:").length).toBeGreaterThanOrEqual(1);
  });

  it("handles not found state", () => {
    render(<EscrowStatusView rentalId="1" escrowId="not-found" />);

    expect(screen.getByText("Escrow not found")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to rental/i }),
    ).toBeInTheDocument();
  });

  it("returns not-found for unmatched escrow IDs not in DEMO_BOOKINGS", () => {
    render(<EscrowStatusView rentalId="1" escrowId="mistyped-escrow-id" />);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(screen.getByText("Escrow not found")).toBeInTheDocument();
    expect(
      screen.queryByText("La Sabana Luxury Apartment"),
    ).not.toBeInTheDocument();
  });

  it("handles error state and preserves simulated error after a failed retry for escrowId='error'", () => {
    render(<EscrowStatusView rentalId="1" escrowId="error" />);

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(screen.getByText("Couldn't load this escrow")).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /retry/i });

    // Click retry starts a new loading attempt
    act(() => {
      fireEvent.click(retryBtn);
    });
    expect(screen.getByRole("main")).toHaveAttribute("aria-busy", "true");

    // After timer, simulated error is preserved for escrowId="error"
    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(screen.getByText("Couldn't load this escrow")).toBeInTheDocument();
  });

  it("recovers and verifies loading completes on retry for transient error", () => {
    render(<EscrowStatusView rentalId="1" escrowId="error-once" />);

    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(screen.getByText("Couldn't load this escrow")).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /retry/i });
    act(() => {
      fireEvent.click(retryBtn);
    });
    expect(screen.getByRole("main")).toHaveAttribute("aria-busy", "true");

    // Timer advances: loading completes successfully
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(screen.getByText("La Sabana Luxury Apartment")).toBeInTheDocument();
    expect(
      screen.queryByText("Couldn't load this escrow"),
    ).not.toBeInTheDocument();
  });

  it("updates last updated time when refresh button is clicked", () => {
    render(<EscrowStatusView rentalId="1" escrowId="test-escrow" />);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    const refreshBtn = screen.getByRole("button", { name: /refresh/i });
    act(() => {
      fireEvent.click(refreshBtn);
    });

    expect(screen.getByText(/last updated/i)).toBeInTheDocument();
  });
});
