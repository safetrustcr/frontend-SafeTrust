import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { ProfileSettingsSidebar } from "./ProfileSettingsSidebar";

jest.mock("next/navigation", () => ({ usePathname: jest.fn() }));

describe("ProfileSettingsSidebar", () => {
  it.each([
    ["/dashboard/profile", "Account"],
    ["/dashboard/apartments", "Apartments"],
    ["/dashboard/apartments/offers", "Offers"],
    ["/dashboard/apartments/1/offers", "Offers"],
    [
      "/dashboard/apartments/3f1c2b0a-a246-4519-a8ca-b94494429623/offers",
      "Offers",
    ],
  ])("highlights only %s's current item", (pathname, label) => {
    jest.mocked(usePathname).mockReturnValue(pathname);
    render(<ProfileSettingsSidebar />);

    const active = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");
    expect(active).toEqual([screen.getByRole("link", { name: label })]);
    expect(screen.getByRole("link", { name: "Offers" })).toHaveAttribute(
      "href",
      "/dashboard/apartments/offers",
    );
  });

  it.each([
    "/dashboard/apartments/new",
    "/dashboard/apartments/1/edit",
    "/dashboard/apartments/1/offers-extra",
    "/dashboard/hotels/1/offers",
  ])("does not highlight Offers for the unrelated route %s", (pathname) => {
    jest.mocked(usePathname).mockReturnValue(pathname);
    render(<ProfileSettingsSidebar />);
    expect(screen.getByRole("link", { name: "Offers" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
