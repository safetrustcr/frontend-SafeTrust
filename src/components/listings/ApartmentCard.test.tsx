import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import ApartmentCard from "./ApartmentCard";
import { APARTMENT_LISTINGS } from "@/lib/mockData/apartmentListings";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();

describe("ApartmentCard – Interactions and Accessibility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("asserts no button-in-button, anchor-in-button, or button-in-anchor nesting", () => {
    const { container } = render(
      <ApartmentCard apartment={APARTMENT_LISTINGS[0]} />,
    );

    expect(
      container.querySelector("button button, a button, button a"),
    ).toBeNull();
  });

  it("renders Book and Message host as valid links/buttons with correct destinations", () => {
    render(<ApartmentCard apartment={APARTMENT_LISTINGS[0]} />);

    const bookLink = screen.getByRole("link", { name: /Book/i });
    expect(bookLink).toBeInTheDocument();
    expect(bookLink).toHaveAttribute(
      "href",
      `/rent/${APARTMENT_LISTINGS[0].id}/escrow/create`,
    );

    const messageLink = screen.getByRole("link", { name: /Message host/i });
    expect(messageLink).toBeInTheDocument();
    expect(messageLink).toHaveAttribute("href", "/dashboard/messages/conv-4");
  });

  it("renders primary title as a link stretching over the card via after pseudo-element", () => {
    render(<ApartmentCard apartment={APARTMENT_LISTINGS[0]} />);

    const titleLink = screen.getByRole("link", {
      name: APARTMENT_LISTINGS[0].name,
    });
    expect(titleLink).toBeInTheDocument();
    expect(titleLink).toHaveAttribute(
      "href",
      `/rent/${APARTMENT_LISTINGS[0].id}`,
    );
    expect(titleLink.className).toContain("after:absolute");
    expect(titleLink.className).toContain("after:inset-0");
  });

  it("supports favorite toggle button with aria-label and aria-pressed when provided", () => {
    const onToggleFavorite = jest.fn();
    render(
      <ApartmentCard
        apartment={APARTMENT_LISTINGS[0]}
        isFavorite={false}
        onToggleFavorite={onToggleFavorite}
      />,
    );

    const favButton = screen.getByRole("button", {
      name: new RegExp(`Save ${APARTMENT_LISTINGS[0].name} to favorites`, "i"),
    });
    expect(favButton).toBeInTheDocument();
    expect(favButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(favButton);
    expect(onToggleFavorite).toHaveBeenCalledWith(APARTMENT_LISTINGS[0].id);
  });
});

describe("ApartmentCard – lucide icon rendering", () => {
  const promotedApartment = APARTMENT_LISTINGS[0]!;
  const nonPromotedApartment = APARTMENT_LISTINGS[1]!;

  it("renders the favorite heart as a lucide SVG", () => {
    render(<ApartmentCard apartment={promotedApartment} />);

    const heart = screen.getByTestId("listing-card-favorite");
    expect(heart.tagName).toBe("svg");
    expect(heart.getAttribute("class")).toContain("lucide");
    expect(heart).toHaveAttribute("aria-hidden", "true");
  });

  it("renders the promoted flame as a lucide SVG only for promoted listings", () => {
    const first = render(<ApartmentCard apartment={promotedApartment} />);
    const flame = screen.getByTestId("listing-card-promoted");
    expect(flame.tagName).toBe("svg");
    expect(flame.getAttribute("class")).toContain("lucide");
    expect(flame).toHaveAttribute("fill", "currentColor");
    first.unmount();

    render(<ApartmentCard apartment={nonPromotedApartment} />);
    expect(
      screen.queryByTestId("listing-card-promoted"),
    ).not.toBeInTheDocument();
  });

  it("renders the amenity icons as lucide SVGs", () => {
    render(<ApartmentCard apartment={promotedApartment} />);

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
});
