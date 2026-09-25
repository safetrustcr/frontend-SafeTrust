import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import GuestDashboard from "./GuestDashboard";
import { STUB_HOTELS } from "@/lib/mockData/hotels";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();

describe("GuestDashboard – lucide icon rendering", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useRouter } = jest.requireMock("next/navigation");
    useRouter.mockReturnValue({ push: mockPush });
  });

  it("renders the sort icon as a lucide SVG", () => {
    render(<GuestDashboard />);

    const sortIcon = screen.getByTestId("guest-dashboard-sort-icon");
    expect(sortIcon.tagName).toBe("svg");
    expect(sortIcon.getAttribute("class")).toContain("lucide");
    expect(sortIcon).toHaveAttribute("aria-hidden", "true");
  });

  it("labels the sort control next to the lucide icon", () => {
    render(<GuestDashboard />);

    expect(screen.getByText(/Sort by:/i)).toBeInTheDocument();
  });

  it("renders the dashboard header with the unit count", () => {
    render(<GuestDashboard />);

    expect(
      screen.getByText(/Available for rent in/i),
    ).toBeInTheDocument();
    expect(screen.getByText(`${STUB_HOTELS.length} units available`)).toBeInTheDocument();
  });
});
