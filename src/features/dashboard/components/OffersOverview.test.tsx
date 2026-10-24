import { render, screen, within } from "@testing-library/react";
import { useOffersOverview } from "@/hooks/useOffersOverview";
import { OffersOverview } from "./OffersOverview";

jest.mock("@/hooks/useOffersOverview");
jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/apartments/offers",
}));

const mockOverview = jest.mocked(useOffersOverview);

beforeEach(() => {
  mockOverview.mockReturnValue({ data: [], loading: false, error: null });
});

it("offers to list a property when there are no properties", () => {
  render(<OffersOverview />);
  expect(screen.getByRole("heading", { name: "Offers" })).toBeInTheDocument();
  expect(screen.getByText("Demo")).toBeInTheDocument();
  expect(
    screen.getByText("You haven't listed a property yet"),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "List a property" })).toHaveAttribute(
    "href",
    "/dashboard/apartments/new",
  );
  expect(screen.queryByText("No offers yet")).not.toBeInTheDocument();
});

it("lists each property with a linked zero, singular, or plural offer count", () => {
  mockOverview.mockReturnValue({
    data: [
      {
        apartmentId: "property/a b",
        name: "Studio",
        address: "San Jose",
        offers: 0,
      },
      {
        apartmentId: "3f1c2b0a-a246-4519-a8ca-b94494429623",
        name: "House",
        address: "Heredia",
        offers: 1,
      },
      { apartmentId: "3", name: "Loft", address: "Escazu", offers: 12 },
    ],
    loading: false,
    error: null,
  });
  render(<OffersOverview />);

  const list = screen.getByRole("list", { name: "Property offers" });
  expect(within(list).getAllByRole("listitem")).toHaveLength(3);
  expect(
    within(list).getByRole("link", { name: "Studio San Jose No offers yet" }),
  ).toHaveAttribute("href", "/dashboard/apartments/property%2Fa%20b/offers");
  expect(
    within(list).getByRole("link", { name: "House Heredia 1 offer" }),
  ).toHaveAttribute(
    "href",
    "/dashboard/apartments/3f1c2b0a-a246-4519-a8ca-b94494429623/offers",
  );
  expect(
    within(list).getByRole("link", { name: "Loft Escazu 12 offers" }),
  ).toHaveAttribute("href", "/dashboard/apartments/3/offers");
  expect(
    screen.queryByText("You haven't listed a property yet"),
  ).not.toBeInTheDocument();
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});

it("shows a skeleton while loading instead of an empty state", () => {
  mockOverview.mockReturnValue({ data: [], loading: true, error: null });
  render(<OffersOverview />);
  expect(
    screen.getByRole("status", { name: "Loading offers" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByText("You haven't listed a property yet"),
  ).not.toBeInTheDocument();
});

it("shows retry and back actions on an error instead of an empty state", () => {
  mockOverview.mockReturnValue({
    data: [],
    loading: false,
    error: new Error("Unavailable"),
  });
  render(<OffersOverview />);
  expect(screen.getByRole("alert")).toHaveTextContent("Unable to load offers");
  expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Back to apartments" }),
  ).toHaveAttribute("href", "/dashboard/apartments");
  expect(
    screen.queryByText("You haven't listed a property yet"),
  ).not.toBeInTheDocument();
});
