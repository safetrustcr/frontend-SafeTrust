import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ListingLocation } from "./ListingLocation";
import type { ApartmentListing } from "@/types/hotel";
import { APARTMENT_LISTINGS } from "@/lib/mockData/apartmentListings";

jest.mock("../map/ListingPinMap", () => ({
  __esModule: true,
  ListingPinMap: ({
    center,
    title,
  }: {
    center: [number, number];
    title?: string;
  }) => (
    <div data-testid="mock-listing-pin-map" data-center={center.join(",")}>
      Map preview: {title}
    </div>
  ),
}));

describe("ListingLocation", () => {
  const mockListing: ApartmentListing = APARTMENT_LISTINGS[0]!;

  it("renders heading and address, and does not show map initially", () => {
    render(<ListingLocation listing={mockListing} />);

    expect(
      screen.getByRole("heading", { name: "Where you'll stay" }),
    ).toBeInTheDocument();
    expect(screen.getByText(mockListing.address)).toBeInTheDocument();
    expect(screen.getByText("Approximate demo location.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Show map" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("mock-listing-pin-map"),
    ).not.toBeInTheDocument();
  });

  it("shows the map only after clicking 'Show map'", async () => {
    render(<ListingLocation listing={mockListing} />);

    const showMapButton = screen.getByRole("button", { name: "Show map" });
    fireEvent.click(showMapButton);

    await waitFor(() => {
      expect(screen.getByTestId("mock-listing-pin-map")).toBeInTheDocument();
    });
    expect(screen.getByTestId("mock-listing-pin-map")).toHaveAttribute(
      "data-center",
      `${mockListing.coordinates.lat},${mockListing.coordinates.lng}`,
    );
  });

  it("renders address only without 'Show map' button when coordinates are missing", () => {
    const listingWithoutCoords = {
      ...mockListing,
      coordinates: undefined as unknown as { lat: number; lng: number },
    };

    render(<ListingLocation listing={listingWithoutCoords} />);

    expect(screen.getByText(mockListing.address)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Show map" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Approximate demo location."),
    ).not.toBeInTheDocument();
  });

  it("opens expand dialog on Expand click and restores focus upon closing", async () => {
    render(<ListingLocation listing={mockListing} />);

    // Click Show map
    fireEvent.click(screen.getByRole("button", { name: "Show map" }));
    const expandButton = await screen.findByRole("button", { name: /expand/i });
    expect(expandButton).toBeInTheDocument();

    // Click Expand to open Dialog
    fireEvent.click(expandButton);

    // Dialog should be open
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();

    // Close with Escape key
    fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });

    // Dialog closes
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // Focus restored to the expand button
    expect(expandButton).toHaveFocus();
  });
});
