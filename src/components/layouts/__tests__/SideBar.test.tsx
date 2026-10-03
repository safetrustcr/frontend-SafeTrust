import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { SideBar } from "../SideBar";
import { NAV_ITEMS } from "../nav-items";
import { usePathname } from "next/navigation";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("@/components/auth/LogoutButton", () => ({
  LogoutButton: () => <div data-testid="logout-button" />,
}));

describe("SideBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    expect(profileLink).toHaveClass("bg-accent");
    expect(profileLink).toHaveAttribute("aria-current", "page");
  });

  it("prioritizes exact match over prefix match for nested item routes", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard/hotels/new");
    render(<SideBar />);
    const newHotelLink = screen.getByRole("link", { name: /new hotel/i });
    const hotelsLink = screen.getByRole("link", { name: /^hotels/i });

    expect(newHotelLink).toHaveAttribute("aria-current", "page");
    expect(newHotelLink).toHaveClass("bg-accent");
    expect(hotelsLink).not.toHaveAttribute("aria-current");
    expect(hotelsLink).not.toHaveClass("bg-accent");
  });

  it("preserves prefix match for nested routes without their own item", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard/hotels/123/edit");
    render(<SideBar />);
    const hotelsLink = screen.getByRole("link", { name: /^hotels/i });

    expect(hotelsLink).toHaveAttribute("aria-current", "page");
    expect(hotelsLink).toHaveClass("bg-accent");
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
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
