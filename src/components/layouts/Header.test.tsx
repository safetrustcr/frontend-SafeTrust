import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "./Header";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    priority: _priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt="" {...props} />
  ),
}));

jest.mock("@/hooks/useCurrentUser", () => ({ useCurrentUser: jest.fn() }));

jest.mock("@/components/navigation/AccountMenu", () => ({
  AccountMenu: () => <div data-testid="account-menu" />,
}));

jest.mock("@/hooks/useWallet", () => ({
  useWallet: () => ({ address: null }),
}));

jest.mock("@/components/layouts/SearchHeader", () => ({
  SearchHeader: () => <div data-testid="search-header" />,
}));

jest.mock("@/components/ui/ThemeToggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

const signedInAs = (displayName: string) =>
  (useCurrentUser as jest.Mock).mockReturnValue({
    user: { uid: "u-1", email: null, displayName },
    loading: false,
  });

describe("Header", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useCurrentUser as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });
  });

  it("renders the shared account menu", () => {
    render(<Header />);
    expect(screen.getByTestId("account-menu")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /go to profile/i }),
    ).not.toBeInTheDocument();
  });

  it("links a signed-in user to the dashboard", () => {
    signedInAs("John Doe");
    render(<Header />);
    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
      "href",
      "/dashboard",
    );
  });

  it("does not show a dashboard link when signed out", () => {
    render(<Header />);
    expect(
      screen.queryByRole("link", { name: /dashboard/i }),
    ).not.toBeInTheDocument();
  });

  it("navigates to /dashboard/notifications when notification bell is clicked", () => {
    render(<Header />);
    const bellButton = screen.getByRole("button", { name: /notifications/i });
    fireEvent.click(bellButton);
    expect(mockPush).toHaveBeenCalledWith("/dashboard/notifications");
  });
});
