import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { useParams } from "next/navigation";
import { useApartmentOffers } from "@/hooks/useApartmentOffers";
import { ApartmentOffers } from "./ApartmentOffers";

const mockNavigate = jest.fn();
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
  usePathname: () => "/dashboard/apartments/1/offers",
  useRouter: () => ({ push: mockNavigate, replace: mockNavigate }),
}));
jest.mock("@/hooks/useApartmentOffers");
jest.mock("@/components/dashboard/ui/DashboardGlassCard", () => ({
  DashboardGlassCard: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

const mockOffers = jest.mocked(useApartmentOffers);
const actualOffers = jest.requireActual<
  typeof import("@/hooks/useApartmentOffers")
>("@/hooks/useApartmentOffers").useApartmentOffers;
const emptyData = { apartment: null, offers: [], totalCount: 0 };

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useParams).mockReturnValue({ id: "1" });
  mockOffers.mockImplementation(actualOffers);
});

it("renders an unknown UUID as not found without navigating or warning", () => {
  const id = "3f1c2b0a-a246-4519-a8ca-b94494429623";
  jest.mocked(useParams).mockReturnValue({ id });
  const consoleError = jest
    .spyOn(console, "error")
    .mockImplementation(() => {});
  try {
    render(<ApartmentOffers />);
    expect(mockOffers).toHaveBeenCalledWith(id);
    expect(
      screen.getByRole("heading", { name: "Property not found" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("It may have been removed, or it isn't yours."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to offers" }),
    ).toHaveAttribute("href", "/dashboard/apartments/offers");
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  } finally {
    consoleError.mockRestore();
  }
});

it("renders the existing applicant table for a known string id", () => {
  render(<ApartmentOffers />);
  expect(
    screen.getByRole("heading", { name: "La Sabana Sur Studio" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Demo")).toBeInTheDocument();
  expect(screen.getByRole("table")).toBeInTheDocument();
  expect(screen.getAllByText(/Diego Duarte/)).toHaveLength(5);
  expect(screen.getByRole("link", { name: "Back to offers" })).toHaveAttribute(
    "href",
    "/dashboard/apartments/offers",
  );
  expect(mockNavigate).not.toHaveBeenCalled();
});

it("shows a property's zero-offer state without treating it as missing", () => {
  jest.mocked(useParams).mockReturnValue({ id: "2" });
  render(<ApartmentOffers />);
  expect(
    screen.getByRole("heading", { name: "Los Yoses Apartment" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "No offers yet" }),
  ).toBeInTheDocument();
  expect(screen.queryByText("Property not found")).not.toBeInTheDocument();
});

it("waits for loading before deciding that the property is missing", () => {
  mockOffers.mockReturnValue({ data: emptyData, loading: true, error: null });
  render(<ApartmentOffers />);
  expect(
    screen.getByRole("status", { name: "Loading offers" }),
  ).toBeInTheDocument();
  expect(screen.queryByText("Property not found")).not.toBeInTheDocument();
  expect(mockNavigate).not.toHaveBeenCalled();
});

it("shows a recoverable error before deciding that the property is missing", () => {
  mockOffers.mockReturnValue({
    data: emptyData,
    loading: false,
    error: new Error("Unavailable"),
  });
  render(<ApartmentOffers />);
  expect(screen.getByRole("alert")).toHaveTextContent("Unable to load offers");
  expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Back to apartments" }),
  ).toHaveAttribute("href", "/dashboard/apartments");
  expect(screen.queryByText("Property not found")).not.toBeInTheDocument();
  expect(mockNavigate).not.toHaveBeenCalled();
});
