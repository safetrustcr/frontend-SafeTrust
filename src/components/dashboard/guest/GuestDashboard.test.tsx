import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import GuestDashboard from "./GuestDashboard";
import { APARTMENT_LISTINGS } from "@/lib/mockData/apartmentListings";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => "/dashboard/guest"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

const mockPush = jest.fn();

describe("GuestDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useRouter, useSearchParams } = jest.requireMock("next/navigation");
    useRouter.mockReturnValue({ push: mockPush, replace: jest.fn() });
    useSearchParams.mockReturnValue(new URLSearchParams());
  });

  it("renders the sort menu control with Sort by: Relevance", () => {
    render(<GuestDashboard />);

    expect(screen.getByRole("button", { name: /Sort by:\s*Relevance/i })).toBeInTheDocument();
  });

  it("renders the dashboard header with fallback Costa Rica when no location selected", () => {
    render(<GuestDashboard />);

    expect(screen.getByText(/Available for rent in/i)).toBeInTheDocument();
    expect(screen.getByText("all of Costa Rica")).toBeInTheDocument();
    expect(
      screen.getByText(`${APARTMENT_LISTINGS.length} units available`),
    ).toBeInTheDocument();
  });
});
