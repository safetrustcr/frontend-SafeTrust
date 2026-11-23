import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { MyBookings } from "@/features/bookings";
import type { BookingItem } from "@/features/bookings";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
}));

const mockUseCurrentUser = jest.fn();
jest.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

const TEST_BOOKINGS: BookingItem[] = [
  {
    id: "trip-1",
    listingId: "1",
    listingName: "La Sabana Luxury Apartment",
    listingPhoto: "/img/room1.png",
    checkIn: "2026-12-01",
    checkOut: "2026-12-05",
    amount: 850,
    currency: "USDC",
    status: "ACTIVE",
    role: "guest",
    escrowId: "escrow-1",
    hostName: "Alberto Casas",
  },
  {
    id: "trip-2",
    listingId: "2",
    listingName: "Casa Verde Downtown",
    listingPhoto: "/img/room2.png",
    checkIn: "2026-11-10",
    checkOut: "2026-11-14",
    amount: 620,
    currency: "USDC",
    status: "COMPLETED",
    role: "guest",
    escrowId: "escrow-2",
  },
  {
    id: "host-1",
    listingId: "1",
    listingName: "La Sabana Luxury Apartment",
    listingPhoto: "/img/room1.png",
    checkIn: "2026-12-10",
    checkOut: "2026-12-15",
    amount: 1100,
    currency: "USDC",
    status: "ACTIVE",
    role: "host",
    escrowId: "escrow-3",
    guestName: "John Smith",
  },
];

describe("MyBookings component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCurrentUser.mockReturnValue({
      user: {
        uid: "user-1",
        roles: ["guest", "host"],
        activeRole: "guest",
      },
      loading: false,
    });
  });

  it("renders Trips and Hosting tabs for a multi-role user", () => {
    render(
      <MyBookings
        initialBookings={TEST_BOOKINGS}
        userRoles={["guest", "host"]}
      />,
    );

    expect(screen.getByRole("tab", { name: "Trips" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Hosting" })).toBeInTheDocument();
  });

  it("supports keyboard navigation with arrow keys and roving tabindex", () => {
    render(
      <MyBookings
        initialBookings={TEST_BOOKINGS}
        userRoles={["guest", "host"]}
      />,
    );

    const tripsTab = screen.getByRole("tab", { name: "Trips" });
    const hostingTab = screen.getByRole("tab", { name: "Hosting" });

    expect(tripsTab).toHaveAttribute("tabindex", "0");
    expect(hostingTab).toHaveAttribute("tabindex", "-1");
    expect(tripsTab).toHaveAttribute("aria-selected", "true");

    // Press ArrowRight moves to Hosting tab
    fireEvent.keyDown(tripsTab, { key: "ArrowRight" });
    expect(hostingTab).toHaveAttribute("tabindex", "0");
    expect(tripsTab).toHaveAttribute("tabindex", "-1");
    expect(hostingTab).toHaveAttribute("aria-selected", "true");

    // Press ArrowLeft wraps back to Trips tab
    fireEvent.keyDown(hostingTab, { key: "ArrowLeft" });
    expect(tripsTab).toHaveAttribute("tabindex", "0");
    expect(hostingTab).toHaveAttribute("tabindex", "-1");
    expect(tripsTab).toHaveAttribute("aria-selected", "true");
  });

  it("reconciles selected role when auth transitions from null to host-only", () => {
    mockUseCurrentUser.mockReturnValue({
      user: null,
      loading: true,
    });

    const { rerender } = render(<MyBookings initialBookings={TEST_BOOKINGS} />);

    // Initial state before auth loads shows Trips
    expect(screen.getByRole("tab", { name: "Trips" })).toBeInTheDocument();

    // Transition auth: user has only host role
    mockUseCurrentUser.mockReturnValue({
      user: {
        uid: "user-1",
        roles: ["host"],
        activeRole: "host",
      },
      loading: false,
    });

    rerender(<MyBookings initialBookings={TEST_BOOKINGS} />);

    // Unavailable role tabs are hidden
    expect(
      screen.queryByRole("tab", { name: "Trips" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: "Hosting" }),
    ).not.toBeInTheDocument();

    // Host bookings are reachable
    expect(screen.getAllByText("Guest: John Smith").length).toBeGreaterThan(0);
  });

  it("hides tabs if user has only guest role", () => {
    render(
      <MyBookings initialBookings={TEST_BOOKINGS} userRoles={["guest"]} />,
    );

    expect(
      screen.queryByRole("tab", { name: "Trips" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: "Hosting" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByText("La Sabana Luxury Apartment").length,
    ).toBeGreaterThan(0);
  });

  it("hides tabs if user has only host role and shows host bookings", () => {
    render(<MyBookings initialBookings={TEST_BOOKINGS} userRoles={["host"]} />);

    expect(
      screen.queryByRole("tab", { name: "Trips" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: "Hosting" }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText("Guest: John Smith").length).toBeGreaterThan(0);
  });

  it("filters bookings by status", () => {
    render(
      <MyBookings
        initialBookings={TEST_BOOKINGS}
        userRoles={["guest", "host"]}
      />,
    );

    expect(
      screen.getAllByText("La Sabana Luxury Apartment").length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("Casa Verde Downtown").length).toBeGreaterThan(
      0,
    );

    const completedFilter = screen.getByRole("button", { name: "Completed" });
    fireEvent.click(completedFilter);

    expect(
      screen.queryByText("La Sabana Luxury Apartment"),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText("Casa Verde Downtown").length).toBeGreaterThan(
      0,
    );
  });

  it("shows empty state with link to browse stays for guests", () => {
    render(<MyBookings initialBookings={[]} userRoles={["guest"]} />);

    expect(screen.getByText("No trips yet, browse stays")).toBeInTheDocument();
    const browseLink = screen.getByRole("link", { name: /browse stays/i });
    expect(browseLink).toHaveAttribute("href", "/rent");
  });

  it("shows empty state with link to listings for hosts", () => {
    render(<MyBookings initialBookings={[]} userRoles={["host"]} />);

    expect(screen.getByText("No bookings yet")).toBeInTheDocument();
    const listingsLink = screen.getByRole("link", {
      name: /view your listings/i,
    });
    expect(listingsLink).toHaveAttribute("href", "/dashboard/apartments");
  });

  it("navigates to the escrow status page on clicking View", () => {
    render(
      <MyBookings initialBookings={TEST_BOOKINGS} userRoles={["guest"]} />,
    );

    const viewButtons = screen.getAllByRole("button", { name: /view/i });
    fireEvent.click(viewButtons[0]);

    expect(mockPush).toHaveBeenCalledWith("/rent/1/escrow/escrow-1");
  });
});
