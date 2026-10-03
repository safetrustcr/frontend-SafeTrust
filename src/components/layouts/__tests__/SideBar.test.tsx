import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { SideBar } from "../SideBar";
import { usePathname } from "next/navigation";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("@/components/auth/LogoutButton", () => ({
  LogoutButton: () => <div data-testid="logout-button" />,
}));

// Mock useCurrentUser to avoid triggering Firebase SDK initialisation in tests.
jest.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    user: {
      uid: "test-user-123",
      email: "test@example.com",
      roles: ["guest"],
      activeRole: "guest",
    },
    loading: false,
  }),
}));

describe("SideBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue("/dashboard");
  });

  it("renders Profile link in sidebar", () => {
    render(<SideBar />);
    const profileLink = screen.getByRole("link", { name: /profile/i });
    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveAttribute("href", "/dashboard/profile");
  });

  it("highlights Profile link when pathname is /dashboard/profile", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard/profile");
    render(<SideBar />);
    const profileLink = screen.getByRole("link", { name: /profile/i });
    expect(profileLink.className).toContain("bg-accent");
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
