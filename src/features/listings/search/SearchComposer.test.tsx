import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchComposer } from "./SearchComposer";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/rent",
  useSearchParams: () => new URLSearchParams(),
}));

describe("SearchComposer", () => {
  beforeAll(() => {
    window.matchMedia = ((query: string) => ({
      matches: true, // desktop mode -> Dialog
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })) as unknown as typeof window.matchMedia;
  });

  beforeEach(() => {
    mockPush.mockClear();
  });

  it("disables Search button when children are added without an adult", () => {
    render(<SearchComposer />);

    // Open composer
    fireEvent.click(screen.getByRole("button", { name: /^Search stays:/ }));

    // Expand Who section
    fireEvent.click(screen.getByRole("button", { name: /^Who\?/ }));

    const searchButton = screen.getByRole("button", { name: "Search" });
    expect(searchButton).toBeEnabled();

    // Increase children with 0 adults
    fireEvent.click(screen.getByRole("button", { name: "Increase children" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Add at least one adult",
    );
    expect(searchButton).toBeDisabled();

    // Increase adults to 1 -> error disappears and Search is enabled
    fireEvent.click(screen.getByRole("button", { name: "Increase adults" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(searchButton).toBeEnabled();

    // Click search
    fireEvent.click(searchButton);
    expect(mockPush).toHaveBeenCalledWith("/rent?adults=1&children=1");
  });

  it("resets guest counts on Clear all and re-enables Search", () => {
    render(<SearchComposer />);

    fireEvent.click(screen.getByRole("button", { name: /^Search stays:/ }));
    fireEvent.click(screen.getByRole("button", { name: /^Who\?/ }));

    // Add children without adult -> disabled
    fireEvent.click(screen.getByRole("button", { name: "Increase children" }));
    expect(screen.getByRole("button", { name: "Search" })).toBeDisabled();

    // Clear all
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeEnabled();
  });
});
