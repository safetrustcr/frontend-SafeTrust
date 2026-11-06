import { render, screen } from "@testing-library/react";
import { ApiError, listBookings } from "@/features/bookings";
import { RoleEscrowDashboardPage } from "./RoleEscrowDashboardPage";

jest.mock("@/lib/demo", () => ({ DEMO_MODE: false }));
jest.mock("@/lib/mockData/dashboard", () => ({
  fetchMockEscrows: jest.fn(),
  generateMockNotifications: jest.fn(() => []),
}));
jest.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ user: null, loading: false }),
}));
jest.mock("@/features/bookings", () => ({
  ...jest.requireActual("@/features/bookings/api"),
  listBookings: jest.fn(),
}));
jest.mock("next/dynamic", () => () => {
  const Dashboard = ({ error }: { error: string | null }) => <p>{error}</p>;
  return Dashboard;
});

const mockListBookings = jest.mocked(listBookings);

describe("RoleEscrowDashboardPage errors", () => {
  it("says so when no backend is connected", async () => {
    mockListBookings.mockRejectedValue(
      new ApiError("BACKEND_UNAVAILABLE", 503, "BACKEND_UNAVAILABLE"),
    );
    render(<RoleEscrowDashboardPage />);

    expect(
      await screen.findByText(
        "Escrow data isn't available because no backend is connected.",
      ),
    ).toBeInTheDocument();
  });

  it("keeps the general message for other failures", async () => {
    mockListBookings.mockRejectedValue(new ApiError("Network error", 0));
    render(<RoleEscrowDashboardPage />);

    expect(
      await screen.findByText("Failed to load escrow dashboard data."),
    ).toBeInTheDocument();
  });
});
