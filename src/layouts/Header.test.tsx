import "@testing-library/jest-dom";
import { fireEvent, render } from "@testing-library/react";
import Header from "./Header";

jest.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: jest.fn() }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("@/components/ui/ThemeToggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

const getLucideIcons = (container: HTMLElement, icon: string) =>
  Array.from(container.querySelectorAll(`svg.lucide-${icon}`));

const getMobileToggle = (container: HTMLElement) =>
  container.querySelector('button[class*="lg:hidden"]') as HTMLButtonElement;

describe("layouts Header – decorative lucide icons", () => {
  it("renders lucide icons for search, profile and notifications", () => {
    const { container } = render(<Header />);

    expect(getLucideIcons(container, "search")).toHaveLength(1);
    expect(getLucideIcons(container, "circle-user-round")).toHaveLength(1);
    expect(getLucideIcons(container, "bell")).toHaveLength(1);
  });

  it("marks every icon as decorative with aria-hidden", () => {
    const { container } = render(<Header />);

    const icons = container.querySelectorAll("svg.lucide");
    expect(icons.length).toBeGreaterThan(0);
    for (const icon of icons) {
      expect(icon).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("keeps the mobile menu icons decorative after opening the menu", () => {
    const { container } = render(<Header />);

    fireEvent.click(getMobileToggle(container));

    // Desktop + mobile duplicates are rendered once the menu is open.
    expect(getLucideIcons(container, "search")).toHaveLength(2);
    expect(getLucideIcons(container, "circle-user-round")).toHaveLength(2);
    expect(getLucideIcons(container, "bell")).toHaveLength(2);

    for (const icon of container.querySelectorAll("svg.lucide")) {
      expect(icon).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("toggles the mobile menu open and closed", () => {
    const { container } = render(<Header />);

    expect(container.querySelector("div.fixed")).toBeNull();

    fireEvent.click(getMobileToggle(container));
    expect(container.querySelector("div.fixed")).not.toBeNull();

    fireEvent.click(getMobileToggle(container));
    expect(container.querySelector("div.fixed")).toBeNull();
  });

  it("shows and hides the search field from the mobile menu", () => {
    const { container } = render(<Header />);

    fireEvent.click(getMobileToggle(container));
    const drawer = container.querySelector("div.fixed") as HTMLElement;
    const searchButton = Array.from(drawer.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("header.search"),
    );
    expect(searchButton).toBeDefined();

    expect(document.getElementById("search-navbar")).toBeNull();
    fireEvent.click(searchButton as HTMLButtonElement);
    expect(document.getElementById("search-navbar")).not.toBeNull();

    fireEvent.click(searchButton as HTMLButtonElement);
    expect(document.getElementById("search-navbar")).toBeNull();
  });
});
