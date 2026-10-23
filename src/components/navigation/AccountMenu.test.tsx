import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AccountMenu } from "./AccountMenu";
import type { CurrentUser } from "@/hooks/useCurrentUser";

let mockUser: CurrentUser = null;
let mockAuthLoading = false;

jest.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ user: mockUser, loading: mockAuthLoading }),
}));

// The real LogoutButton renders here (it must survive `asChild`), it just
// must not navigate during tests.
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const trigger = () => screen.getByTestId("header-account-menu");

const openMenu = () => {
  fireEvent.keyDown(trigger(), { key: "Enter" });
};

describe("AccountMenu signed out", () => {
  beforeEach(() => {
    mockUser = null;
    mockAuthLoading = false;
  });

  it("labels the trigger for guests and offers the six signed-out items", () => {
    render(<AccountMenu />);
    const button = trigger();
    expect(button).toHaveAccessibleName("Account menu");
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute("aria-haspopup", "menu");

    openMenu();

    expect(screen.getByRole("menuitem", { name: "Messages" })).toHaveAttribute(
      "href",
      "/login?redirect=%2Fdashboard%2Fmessages",
    );
    expect(screen.getByRole("menuitem", { name: "Wishlists" })).toHaveAttribute(
      "href",
      "/login?redirect=%2Fdashboard%2Ffavorites",
    );
    expect(
      screen.getByRole("menuitem", { name: "Notifications" }),
    ).toHaveAttribute("href", "/login?redirect=%2Fdashboard%2Fnotifications");
    expect(screen.getByRole("menuitem", { name: "Profile" })).toHaveAttribute(
      "href",
      "/guest/profile",
    );
    expect(screen.getByRole("menuitem", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login?redirect=%2Fdashboard%2Fprofile",
    );
    expect(screen.getByRole("menuitem", { name: "Sign up" })).toHaveAttribute(
      "href",
      "/register?redirect=%2Fdashboard%2Fprofile",
    );
    expect(
      screen.queryByRole("menuitem", { name: "Log out" }),
    ).not.toBeInTheDocument();
  });

  it("shows the guest avatar instead of anyone's initials", () => {
    render(<AccountMenu />);
    expect(screen.getByTestId("header-account-guest")).toBeInTheDocument();
    expect(screen.queryByTestId("header-account-initials")).toBeNull();
  });
});

describe("AccountMenu signed in", () => {
  beforeEach(() => {
    mockUser = {
      uid: "user-1",
      email: "ana.guest@safetrust.test",
      displayName: "Ana Guest",
      roles: ["guest"],
      activeRole: "guest",
    };
    mockAuthLoading = false;
  });

  it("names the trigger after the verified user and shows their initials", () => {
    render(<AccountMenu />);
    expect(trigger()).toHaveAccessibleName("Account menu for Ana Guest");
    expect(screen.getByTestId("header-account-initials")).toHaveTextContent(
      "AG",
    );
  });

  it("links straight to the protected routes and offers Log out only", () => {
    render(<AccountMenu />);
    openMenu();

    expect(screen.getByRole("menuitem", { name: "Messages" })).toHaveAttribute(
      "href",
      "/dashboard/messages",
    );
    expect(screen.getByRole("menuitem", { name: "Wishlists" })).toHaveAttribute(
      "href",
      "/dashboard/favorites",
    );
    expect(
      screen.getByRole("menuitem", { name: "Notifications" }),
    ).toHaveAttribute("href", "/dashboard/notifications");
    expect(screen.getByRole("menuitem", { name: "Profile" })).toHaveAttribute(
      "href",
      "/dashboard/profile",
    );
    expect(
      screen.getByRole("menuitem", { name: "Log out" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: "Log in" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: "Sign up" }),
    ).not.toBeInTheDocument();
  });

  it("falls back to the e-mail initials for a user without a name", () => {
    mockUser = {
      uid: "user-1",
      email: "ana.guest@safetrust.test",
      displayName: null,
      roles: ["guest"],
      activeRole: "guest",
    };
    render(<AccountMenu />);
    expect(trigger()).toHaveAccessibleName(
      "Account menu for ana.guest@safetrust.test",
    );
    // "ana.guest@safetrust.test" -> first letters of "ana.guest" and
    // "safetrust.test".
    expect(screen.getByTestId("header-account-initials")).toHaveTextContent(
      "AS",
    );
  });
});

describe("AccountMenu while auth resolves", () => {
  beforeEach(() => {
    mockUser = null;
    mockAuthLoading = true;
  });

  it("disables the trigger so no identity can flash", () => {
    render(<AccountMenu />);
    expect(trigger()).toBeDisabled();
    // A generic guest glyph is fine; nobody's name or initials may appear.
    expect(screen.queryByTestId("header-account-initials")).toBeNull();
    expect(trigger()).toHaveAccessibleName("Account menu");
  });
});

describe("AccountMenu keyboard", () => {
  beforeEach(() => {
    mockUser = null;
    mockAuthLoading = false;
  });

  it("opens with Enter, closes on Escape and restores focus to the trigger", async () => {
    render(<AccountMenu />);
    const button = trigger();
    button.focus();

    fireEvent.keyDown(button, { key: "Enter" });
    expect(await screen.findByRole("menu")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() =>
      expect(button).not.toHaveAttribute("data-state", "open"),
    );
    await waitFor(() => expect(button).toHaveFocus());
  });

  it("opens with Space as well", async () => {
    render(<AccountMenu />);
    fireEvent.keyDown(trigger(), { key: " " });
    expect(await screen.findByRole("menu")).toBeInTheDocument();
  });
});
