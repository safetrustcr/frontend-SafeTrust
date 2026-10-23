import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import HotelHeader from "./HotelHeader";

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

jest.mock("next/navigation", () => ({
  usePathname: () => "/rent",
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("@/components/ui/ThemeToggle", () => ({
  ThemeToggle: () => <button type="button">Theme</button>,
}));

// AccountMenu identity comes from Firebase; keep these tests signed out and
// offline (the real LogoutButton only mounts when signed in).
jest.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ user: null, loading: false }),
}));

jest.mock("@/components/auth/LogoutButton", () => {
  const { forwardRef, createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");
  // Must forward its ref: Radix menu items track their DOM node for focus.
  const MockLogoutButton = forwardRef<
    HTMLButtonElement,
    import("react").ComponentPropsWithoutRef<"button">
  >((props, ref) =>
    createElement("button", { type: "button", ref, ...props }, "Log out"),
  );
  return { LogoutButton: MockLogoutButton };
});

describe("HotelHeader rent navigation", () => {
  it("exposes all rent destinations and closes after selection", () => {
    render(<HotelHeader />);
    const trigger = screen.getByRole("button", { name: "Rent" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("menuitem", { name: /browse all units/i }),
    ).toHaveAttribute("href", "/rent");
    expect(
      screen.getByRole("menuitem", { name: /^suggestions/i }),
    ).toHaveAttribute("href", "/guest/suggestions");
    expect(
      screen.getByRole("menuitem", { name: /my wishlist/i }),
    ).toHaveAttribute("href", "/dashboard/favorites");

    fireEvent.click(
      screen.getByRole("menuitem", { name: /browse all units/i }),
    );
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on outside click", () => {
    render(<HotelHeader />);
    const trigger = screen.getByRole("button", { name: "Rent" });
    fireEvent.click(trigger);
    fireEvent.mouseDown(document.body);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on Escape and restores focus to the trigger", () => {
    render(<HotelHeader />);
    const trigger = screen.getByRole("button", { name: "Rent" });
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });
});

describe("HotelHeader lucide icons", () => {
  const lucideIconTestIds = ["header-search-icon"] as const;

  it("renders the header icons as lucide SVGs", async () => {
    render(<HotelHeader />);

    for (const testId of lucideIconTestIds) {
      const icon = await screen.findByTestId(testId);
      expect(icon.tagName).toBe("svg");
      expect(icon.getAttribute("class")).toContain("lucide");
    }
  });

  it("marks every header icon as decorative with aria-hidden", async () => {
    render(<HotelHeader />);

    for (const testId of lucideIconTestIds) {
      expect(await screen.findByTestId(testId)).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    }
  });

  it("renders the dropdown item icons as lucide SVGs when the menu opens", () => {
    render(<HotelHeader />);
    fireEvent.click(screen.getByRole("button", { name: "Rent" }));

    const menuItems = [
      screen.getByRole("menuitem", { name: /browse all units/i }),
      screen.getByRole("menuitem", { name: /^suggestions/i }),
      screen.getByRole("menuitem", { name: /my wishlist/i }),
    ];

    expect(menuItems).toHaveLength(3);
    for (const item of menuItems) {
      const icon = item.querySelector("svg.lucide");
      expect(icon).not.toBeNull();
      expect(icon).toHaveAttribute("aria-hidden", "true");
    }
  });
});

describe("HotelHeader account menu", () => {
  it("replaces the hard-coded name, fake bell and dead user icon", () => {
    render(<HotelHeader />);

    expect(screen.getByTestId("header-account-menu")).toBeInTheDocument();
    expect(screen.queryByText(/Randall Valenciano/i)).toBeNull();
    expect(screen.queryByTestId("header-notification-icon")).toBeNull();
    expect(screen.queryByTestId("header-user-icon")).toBeNull();
    // No decorative "unread" badge left behind.
    expect(document.querySelector(".bg-orange-500")).toBeNull();
  });

  it("reaches Messages through the menu with a login return path", () => {
    render(<HotelHeader />);

    fireEvent.keyDown(screen.getByTestId("header-account-menu"), {
      key: "Enter",
    });

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
  });
});
