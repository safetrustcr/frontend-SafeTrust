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

  it("handles not found state", () => {
    render(<EscrowStatusView rentalId="1" escrowId="not-found" />);

    expect(screen.getByText("Escrow not found")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to rental/i }),
    ).toBeInTheDocument();
  });

  it("handles error state with retry button", () => {
    render(<EscrowStatusView rentalId="1" escrowId="error" />);

    expect(screen.getByText("Couldn't load this escrow")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
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
