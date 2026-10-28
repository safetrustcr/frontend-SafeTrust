import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import GuestSuggestionsPage from "./page";
import { useRouter } from "next/navigation";

let mockSearchParams = "";
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: () => new URLSearchParams(mockSearchParams),
  usePathname: () => "/guest/suggestions",
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: () => <div data-testid="mock-image" />,
}));

jest.mock("@/components/listings/HotelHeader", () => ({
  __esModule: true,
  default: () => <header data-testid="hotel-header" />,
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();

describe("GuestSuggestionsPage – Message host", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = "";
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });
  });

  it("renders the Message host button next to Book for the selected apartment", () => {
    render(<GuestSuggestionsPage />);

    expect(screen.getByRole("button", { name: /Book/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Message host/i }),
    ).toBeInTheDocument();
  });

  it("navigates to the conversation thread for the selected apartment", () => {
    render(<GuestSuggestionsPage />);

    fireEvent.click(screen.getByRole("button", { name: /Message host/i }));

    expect(mockPush).toHaveBeenCalledWith("/dashboard/messages/conv-4");
  });

  it("stores a valid selected listing in the URL and updates the conversation", () => {
    const { rerender } = render(<GuestSuggestionsPage />);

    fireEvent.click(
      screen.getByRole("button", { name: "Select Luz de Los Yoses Studio" }),
    );
    expect(mockPush).toHaveBeenNthCalledWith(
      1,
      "/guest/suggestions?selected=2",
      { scroll: false },
    );
    mockSearchParams = "selected=2";
    rerender(<GuestSuggestionsPage />);
    fireEvent.click(screen.getByRole("button", { name: /Message host/i }));

    expect(mockPush).toHaveBeenLastCalledWith("/dashboard/messages/conv-5");
  });

  it("ignores malformed or filtered-out selected values", () => {
    mockSearchParams = "q=not-a-rental&selected=%3Cscript%3E";

    render(<GuestSuggestionsPage />);

    expect(
      screen.getByRole("heading", { name: "No places match this search" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/q: not-a-rental/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Book with Escrow/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Clear search" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(mockReplace).toHaveBeenCalledWith("/guest/suggestions");
  });

  it("falls back to the first matching result for an unknown valid selection", () => {
    mockSearchParams = "location=Heredia&selected=999";

    render(<GuestSuggestionsPage />);

    expect(
      screen.getByRole("heading", { name: "Jardín de Heredia House" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Book with Escrow/ }),
    ).toBeInTheDocument();
  });

  it("ignores an empty selected parameter and displays the first result", () => {
    mockSearchParams = "location=Heredia&selected=";

    render(<GuestSuggestionsPage />);

    expect(
      screen.getByRole("heading", { name: "Jardín de Heredia House" }),
    ).toBeInTheDocument();
  });

  it("uses URL selection when it matches a filtered result", () => {
    mockSearchParams = "location=Heredia&selected=5";

    render(<GuestSuggestionsPage />);

    expect(
      screen.getByRole("heading", { name: "La Estación Flat" }),
    ).toBeInTheDocument();
  });

  it("uses URL-backed results rather than the full listing set", () => {
    mockSearchParams = "location=Lim%C3%B3n&adults=2";

    render(<GuestSuggestionsPage />);

    expect(screen.getByText("1 unit available")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Select Muelle Viejo Apartment" }),
    ).toBeInTheDocument();
  });

  it("filters the suggestions and selected listing by the applied query", () => {
    mockSearchParams = "q=Heredia";

    render(<GuestSuggestionsPage />);

    expect(screen.getByText("2 units available")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Select Jardín de Heredia House" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Select La Estación Flat" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Jardín de Heredia House" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Select Jardín de Heredia House/ }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: /Select La Estación Flat/ }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.queryByRole("button", { name: /^Select Casa Níspero/ }),
    ).not.toBeInTheDocument();
  });

  it("renders an empty state without selected-listing actions when nothing matches", () => {
    mockSearchParams = "q=No%20such%20place";

    render(<GuestSuggestionsPage />);

    expect(screen.getByText("0 units available")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "No places match this search" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Clear search" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Book with Escrow/ }),
    ).not.toBeInTheDocument();
  });
});
