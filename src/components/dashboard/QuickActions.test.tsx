import { render, screen } from "@testing-library/react";
import { QuickActions } from "./QuickActions";

const expected = {
  guest: [
    ["New booking", "/rent"],
    ["My profile", "/dashboard/profile"],
    ["My escrows", "/dashboard/escrow"],
  ],
  hotel: [
    ["New apartment", "/dashboard/apartments/new"],
    ["My apartments", "/dashboard/apartments"],
    ["My profile", "/dashboard/profile"],
  ],
  admin: [
    ["Manage escrows", "/dashboard/escrow"],
    ["Your account", "/dashboard/users"],
    ["Account security", "/dashboard/profile/security"],
  ],
} as const;

describe("QuickActions", () => {
  (Object.keys(expected) as Array<keyof typeof expected>).forEach((role) => {
    it(`renders honest links for ${role}`, () => {
      render(<QuickActions userRole={role} />);
      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(5);
      for (const [title, href] of expected[role]) {
        const link = screen.getByText(title).closest("a");
        expect(link).toHaveAttribute("href", href);
      }
      expect(screen.getByText("Notifications").closest("a")).toHaveAttribute(
        "href",
        "/dashboard/notifications",
      );
      const help = screen.getByText("Help").closest("a");
      expect(help).toHaveAttribute("href", "/help");
      expect(help).not.toHaveAttribute("target");
      expect(screen.queryByText("Payment Methods")).toBeNull();
      expect(screen.queryByText("User Management")).toBeNull();
      expect(screen.queryByText("System Settings")).toBeNull();
    });
  });
});
