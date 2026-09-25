import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import ApartmentDetail from "./ApartmentDetail";
import { formatListingPrice } from "./formatListingPrice";
import { STUB_HOTELS } from "@/lib/mockData/hotels";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}));

describe("ApartmentDetail – lucide icon rendering", () => {
  const apartment = STUB_HOTELS[0]!;
  const onBook = jest.fn();

  it("renders the location pin as a lucide SVG", () => {
    render(<ApartmentDetail apartment={apartment} onBook={onBook} />);

    const pin = screen.getByTestId("apartment-detail-location-icon");
    expect(pin.tagName).toBe("svg");
    expect(pin.getAttribute("class")).toContain("lucide");
    expect(pin).toHaveAttribute("aria-hidden", "true");
    expect(pin).toHaveAttribute("fill", "currentColor");
  });

  it("renders the address next to the location pin", () => {
    render(<ApartmentDetail apartment={apartment} onBook={onBook} />);

    expect(screen.getByText(apartment.address)).toBeInTheDocument();
  });

  it("renders the amenity icons as lucide SVGs", () => {
    render(<ApartmentDetail apartment={apartment} onBook={onBook} />);

    for (const testId of [
      "amenity-icon-bedrooms",
      "amenity-icon-bathrooms",
      "amenity-icon-pets",
    ]) {
      const icon = screen.getByTestId(testId);
      expect(icon.tagName).toBe("svg");
      expect(icon.getAttribute("class")).toContain("lucide");
    }
  });

  it("shows the listing name, price and BOOK action", () => {
    render(<ApartmentDetail apartment={apartment} onBook={onBook} />);

    expect(screen.getByRole("heading", { name: apartment.name })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /book/i })).toBeInTheDocument();
    expect(
      screen.getByText(formatListingPrice(apartment.price)),
    ).toBeInTheDocument();
  });
});
