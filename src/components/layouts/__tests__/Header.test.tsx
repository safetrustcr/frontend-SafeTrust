import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "../Header";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

jest.mock("@/lib/firebase", () => ({
  auth: {},
}));

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn(),
}));

jest.mock("@/components/layouts/SearchHeader", () => ({
  SearchHeader: () => <div data-testid="search-header" />,
}));

jest.mock("@/components/ui/ThemeToggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

describe("Header", () => {
  const mockPush = jest.fn();
  const mockUnsubscribe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(null);
      return mockUnsubscribe;
    });
  });

  it("renders default fallback 'Account' and '?' when user is null", () => {
    render(<Header />);
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("renders Firebase displayName and initials when user has a displayName", () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback({ displayName: "John Doe" });
      return mockUnsubscribe;
    });

    render(<Header />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("navigates to /dashboard/profile when user button is clicked", () => {
    render(<Header />);
    const userButton = screen.getByRole("button", { name: /go to profile/i });
    fireEvent.click(userButton);
    expect(mockPush).toHaveBeenCalledWith("/dashboard/profile");
  });

  it("navigates to /dashboard/notifications when notification bell is clicked", () => {
    render(<Header />);
    const bellButton = screen.getByRole("button", { name: /notifications/i });
    fireEvent.click(bellButton);
    expect(mockPush).toHaveBeenCalledWith("/dashboard/notifications");
  });

  it("unsubscribes onAuthStateChanged on unmount", () => {
    const { unmount } = render(<Header />);
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
