import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { AccountMenu } from "./AccountMenu";
import { useCurrentUser, type CurrentUser } from "@/hooks/useCurrentUser";

const mockLogout = jest.fn();

jest.mock("@/hooks/useCurrentUser", () => ({ useCurrentUser: jest.fn() }));
jest.mock("@/components/auth/LogoutButton", () => ({
  useLogout: () => mockLogout,
}));

const signedIn: NonNullable<CurrentUser> = {
  uid: "u-1",
  email: "ana.guest@safetrust.test",
  displayName: "Ana Guest",
  roles: ["guest"],
  activeRole: "guest",
};

function renderAs(user: CurrentUser, loading = false) {
  (useCurrentUser as jest.Mock).mockReturnValue({ user, loading });
  render(<AccountMenu />);
}

const openMenu = (name: RegExp) =>
  fireEvent.keyDown(screen.getByRole("button", { name }), { key: "Enter" });

describe("AccountMenu", () => {
  beforeEach(() => jest.clearAllMocks());

  it("sends signed-out visitors through login for protected items", () => {
    renderAs(null);
    openMenu(/^account menu$/i);

    const expected = {
      Messages: "/login?redirect=%2Fdashboard%2Fmessages",
      Wishlists: "/login?redirect=%2Fdashboard%2Ffavorites",
      Notifications: "/login?redirect=%2Fdashboard%2Fnotifications",
      Profile: "/login?redirect=%2Fdashboard%2Fprofile",
      "Log in": "/login?redirect=%2Fdashboard%2Fprofile",
      "Sign up": "/register?redirect=%2Fdashboard%2Fprofile",
    };
    for (const [name, href] of Object.entries(expected)) {
      expect(screen.getByRole("menuitem", { name })).toHaveAttribute(
        "href",
        href,
      );
    }
    expect(
      screen.queryByRole("menuitem", { name: /log out/i }),
    ).not.toBeInTheDocument();
  });

  it("shows initials, direct links and Log out when signed in", () => {
    renderAs(signedIn);
    const trigger = screen.getByRole("button", {
      name: "Account menu for Ana Guest",
    });
    expect(trigger).toHaveTextContent("AG");
    openMenu(/account menu for ana guest/i);

    expect(screen.getByRole("menuitem", { name: "Messages" })).toHaveAttribute(
      "href",
      "/dashboard/messages",
    );
    expect(screen.getByRole("menuitem", { name: "Profile" })).toHaveAttribute(
      "href",
      "/dashboard/profile",
    );
    expect(
      screen.queryByRole("menuitem", { name: /log in|sign up/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("menuitem", { name: "Log out" }));
    expect(mockLogout).toHaveBeenCalled();
  });

  it("falls back to the email for the label and initials", () => {
    renderAs({ ...signedIn, displayName: null });
    expect(
      screen.getByRole("button", {
        name: "Account menu for ana.guest@safetrust.test",
      }),
    ).toHaveTextContent("AS");
  });

  it("is disabled and shows no name while auth is loading", () => {
    renderAs(null, true);
    const trigger = screen.getByRole("button", { name: /^account menu$/i });
    expect(trigger).toBeDisabled();
    expect(trigger).not.toHaveTextContent(/\w/);
  });

  it("closes on Escape", () => {
    renderAs(null);
    openMenu(/^account menu$/i);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
