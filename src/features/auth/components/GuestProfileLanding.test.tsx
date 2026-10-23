import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { GuestProfileLanding } from "./GuestProfileLanding";
import type { CurrentUser } from "@/hooks/useCurrentUser";

let mockUser: CurrentUser = null;
let mockLoading = false;
const mockReplace = jest.fn();

jest.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ user: mockUser, loading: mockLoading }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock("next/image", () => {
  const MockImage = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt || ""} />
  );
  MockImage.displayName = "MockImage";
  return {
    __esModule: true,
    default: MockImage,
  };
});

jest.mock("@/components/listings/HotelHeader", () => {
  const MockHeader = () => <header data-testid="guest-header" />;
  MockHeader.displayName = "MockHeader";
  return { __esModule: true, default: MockHeader };
});

const ANA: NonNullable<CurrentUser> = {
  uid: "user-1",
  email: "ana.guest@safetrust.test",
  displayName: "Ana Guest",
  roles: ["guest"],
  activeRole: "guest",
};

beforeEach(() => {
  mockUser = null;
  mockLoading = false;
  mockReplace.mockReset();
});

describe("GuestProfileLanding", () => {
  it("explains the account and links both auth forms with the return path", () => {
    render(<GuestProfileLanding />);

    expect(screen.getByTestId("guest-header")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Your SafeTrust account" }),
    ).toBeInTheDocument();
    for (const title of ["Save stays", "Message hosts", "Protected deposits"]) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }

    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login?redirect=%2Fdashboard%2Fprofile",
    );
    expect(
      screen.getByRole("link", { name: "Create account" }),
    ).toHaveAttribute("href", "/register?redirect=%2Fdashboard%2Fprofile");
    expect(screen.getByRole("link", { name: "Back to stays" })).toHaveAttribute(
      "href",
      "/rent",
    );

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("renders a stable empty shell while auth resolves — no identity, no CTAs", () => {
    mockLoading = true;
    mockUser = ANA; // known to the hook, but not yet resolved for the page

    const { container } = render(<GuestProfileLanding />);

    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(
      screen.queryByRole("heading", { name: "Your SafeTrust account" }),
    ).toBeNull();
    expect(screen.queryByRole("link", { name: "Create account" })).toBeNull();
    expect(screen.queryByText("Ana Guest")).toBeNull();
    expect(screen.queryByText("ana.guest@safetrust.test")).toBeNull();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("sends a signed-in visitor to the real profile without flashing the landing", () => {
    mockUser = ANA;

    render(<GuestProfileLanding />);

    expect(mockReplace).toHaveBeenCalledWith("/dashboard/profile");
    expect(
      screen.queryByRole("heading", { name: "Your SafeTrust account" }),
    ).toBeNull();
    expect(screen.queryByRole("link", { name: "Log in" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Create account" })).toBeNull();
  });
});
