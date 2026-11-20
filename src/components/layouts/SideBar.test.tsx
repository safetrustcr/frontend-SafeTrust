import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { SideBar } from "./SideBar";
import { NAV_ITEMS } from "./nav-items";
import { usePathname } from "next/navigation";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("@/features/messages", () => ({
  UnreadBadge: () => <span data-testid="unread-badge" />,
}));

jest.mock("@/components/auth/LogoutButton", () => ({
  LogoutButton: () => <div data-testid="logout-button" />,
}));

// Mock useCurrentUser to avoid triggering Firebase SDK initialisation in tests.
// `mockUserRoles` lets individual tests switch between guest and host views.
let mockUserRoles: string[] = ["guest"];
jest.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    user: {
      uid: "test-user-123",
      email: "test@example.com",
      roles: mockUserRoles,
      activeRole: mockUserRoles[0] ?? "guest",
    },
    loading: false,
  }),
}));

describe("SideBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRoles = ["guest"];
    (usePathname as jest.Mock).mockReturnValue("/dashboard");
  });

  it("ensures no two nav items share an href", () => {
    expect(new Set(NAV_ITEMS.map((i) => i.href)).size).toBe(NAV_ITEMS.length);
  });

  it("renders Profile link in sidebar", () => {
    render(<SideBar />);
    const profileLink = screen.getByRole("link", { name: /profile/i });
    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveAttribute("href", "/dashboard/profile");
  });

  it("highlights Profile link and sets aria-current when pathname is /dashboard/profile", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard/profile");
    render(<SideBar />);
    const profileLink = screen.getByRole("link", { name: /profile/i });
    expect(profileLink).toHaveClass("bg-nav-active");
    expect(profileLink).toHaveAttribute("aria-current", "page");
  });

  it("hides host-only links from guests", () => {
    render(<SideBar />);

    for (const name of [
      /hotels/i,
      /new hotel/i,
      /my apartments/i,
      /new apartment/i,
    ]) {
      expect(screen.queryByRole("link", { name })).not.toBeInTheDocument();
    }
    // Non-host links stay visible.
    expect(
      screen.getByRole("link", { name: /escrows/i }),
    ).toBeInTheDocument();
  });

  it("shows host-only links to hosts", () => {
    mockUserRoles = ["guest", "host"];
    render(<SideBar />);

    expect(
      screen.getByRole("link", { name: /^hotels/i }),
    ).toHaveAttribute("href", "/dashboard/hotels");
    expect(
      screen.getByRole("link", { name: /new hotel/i }),
    ).toHaveAttribute("href", "/dashboard/hotels/new");
    expect(
      screen.getByRole("link", { name: /my apartments/i }),
    ).toHaveAttribute("href", "/dashboard/apartments");
    expect(
      screen.getByRole("link", { name: /new apartment/i }),
    ).toHaveAttribute("href", "/dashboard/apartments/new");
  });

  it("prioritizes exact match over prefix match for nested item routes", () => {
    mockUserRoles = ["guest", "host"];
    (usePathname as jest.Mock).mockReturnValue("/dashboard/hotels/new");
    render(<SideBar />);
    const newHotelLink = screen.getByRole("link", { name: /new hotel/i });
    const hotelsLink = screen.getByRole("link", { name: /^hotels/i });

    expect(newHotelLink).toHaveAttribute("aria-current", "page");
    expect(newHotelLink).toHaveClass("bg-nav-active");
    expect(hotelsLink).not.toHaveAttribute("aria-current");
    expect(hotelsLink).not.toHaveClass("bg-nav-active");
  });

  it("preserves prefix match for nested routes without their own item", () => {
    mockUserRoles = ["guest", "host"];
    (usePathname as jest.Mock).mockReturnValue("/dashboard/hotels/123/edit");
    render(<SideBar />);
    const hotelsLink = screen.getByRole("link", { name: /^hotels/i });

    expect(hotelsLink).toHaveAttribute("aria-current", "page");
    expect(hotelsLink).toHaveClass("bg-nav-active");
  });

  it("calls onClose when Profile link is clicked", () => {
    const handleClose = jest.fn();
    render(<SideBar onClose={handleClose} />);
    const profileLink = screen.getByRole("link", { name: /profile/i });
    fireEvent.click(profileLink);
    expect(handleClose).toHaveBeenCalled();
  });

  it("renders a Messages link with the unread badge", () => {
    render(<SideBar />);
    const messagesLink = screen.getByRole("link", { name: /messages/i });
    expect(messagesLink).toBeInTheDocument();
    expect(messagesLink).toHaveAttribute("href", "/dashboard/messages");
    expect(messagesLink).toContainElement(screen.getByTestId("unread-badge"));
  });

  it("announces the unread notification count to screen readers", () => {
    render(<SideBar />);
    const badge = screen.getByTestId("sidebar-notification-unread-count");

    expect(badge).not.toHaveAttribute("aria-label");
    expect(badge.querySelector('[aria-hidden="true"]')).toHaveTextContent("2");
    expect(badge.querySelector(".sr-only")).toHaveTextContent(
      "2 unread notifications",
    );
  });
});
