import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import HotelHeader from "./HotelHeader";

const mockUseSearchParams = jest.fn(() => new URLSearchParams("q=sabana"));

jest.mock("next/navigation", () => ({
  useSearchParams: () => mockUseSearchParams(),
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

jest.mock("@/components/ui/ThemeToggle", () => ({
  ThemeToggle: () => <button type="button">Theme</button>,
}));

describe("HotelHeader rent navigation", () => {
  beforeEach(() => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("q=sabana"));
  });

  it("exposes all rent destinations and closes after selection", () => {
    render(<HotelHeader />);
    const trigger = screen.getByRole("button", { name: "Rent" });

    expect(
      screen.getByRole("searchbox", { name: "Search rentals" }),
    ).toHaveValue("sabana");
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

  it("refreshes the search input when the query changes", () => {
    const { rerender } = render(<HotelHeader />);
    const input = screen.getByRole("searchbox", { name: "Search rentals" });

    fireEvent.change(input, { target: { value: "edited" } });
    mockUseSearchParams.mockReturnValue(new URLSearchParams("q=nosara"));
    rerender(<HotelHeader />);

    expect(
      screen.getByRole("searchbox", { name: "Search rentals" }),
    ).toHaveValue("nosara");
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
