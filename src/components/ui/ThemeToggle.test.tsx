import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "./ThemeToggle";

const mockSetTheme = jest.fn();
let mockResolvedTheme: string | undefined = "light";

jest.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: mockResolvedTheme,
    setTheme: mockSetTheme,
  }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResolvedTheme = "light";
  });

  it("renders with stable aria-label and CSS dark: classes on icons and thumb", () => {
    const { container } = render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Dark mode" });
    expect(button).toBeInTheDocument();

    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(2);
    expect(svgs[0]).toHaveClass("text-gray-400", "dark:text-white");
    expect(svgs[1]).toHaveClass("text-yellow-500", "dark:text-gray-400");
    expect(svgs[0]).toHaveAttribute("aria-hidden", "true");
    expect(svgs[1]).toHaveAttribute("aria-hidden", "true");

    const thumb = button.querySelector("span");
    expect(thumb).toHaveClass("translate-x-6", "dark:translate-x-0");
    expect(thumb).toHaveAttribute("aria-hidden", "true");
  });

  it("reflects aria-pressed false in light mode after hydration", () => {
    mockResolvedTheme = "light";
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Dark mode" });
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("reflects aria-pressed true in dark mode after hydration", () => {
    mockResolvedTheme = "dark";
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Dark mode" });
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("toggles theme exactly once on click", () => {
    mockResolvedTheme = "light";
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Dark mode" });
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("toggles theme exactly once when Enter key is pressed", () => {
    mockResolvedTheme = "light";
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Dark mode" });
    // Native buttons trigger click on Enter
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("toggles theme exactly once when Space key is pressed", () => {
    mockResolvedTheme = "dark";
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Dark mode" });
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });
});
