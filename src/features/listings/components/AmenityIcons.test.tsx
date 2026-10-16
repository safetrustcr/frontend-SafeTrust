import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import AmenityIcons from "./AmenityIcons";

const baseProps = {
  bedrooms: 2,
  bathrooms: 1,
  petFriendly: true,
};

describe("AmenityIcons – lucide icon rendering", () => {
  it("renders the bedrooms, pets and bathrooms lucide icons", () => {
    render(<AmenityIcons {...baseProps} />);

    expect(screen.getByTestId("amenity-icon-bedrooms")).toBeInTheDocument();
    expect(screen.getByTestId("amenity-icon-pets")).toBeInTheDocument();
    expect(screen.getByTestId("amenity-icon-bathrooms")).toBeInTheDocument();
  });

  it("renders each icon as a lucide SVG element", () => {
    render(<AmenityIcons {...baseProps} />);

    for (const testId of [
      "amenity-icon-bedrooms",
      "amenity-icon-pets",
      "amenity-icon-bathrooms",
    ]) {
      const icon = screen.getByTestId(testId);
      expect(icon.tagName).toBe("svg");
      expect(icon.getAttribute("class")).toContain("lucide");
    }
  });

  it("marks every icon as decorative with aria-hidden", () => {
    render(<AmenityIcons {...baseProps} />);

    for (const testId of [
      "amenity-icon-bedrooms",
      "amenity-icon-pets",
      "amenity-icon-bathrooms",
    ]) {
      expect(screen.getByTestId(testId)).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("renders the amenity labels next to the icons", () => {
    render(<AmenityIcons {...baseProps} />);

    expect(screen.getByText("2 bd.")).toBeInTheDocument();
    expect(screen.getByText("1 ba.")).toBeInTheDocument();
    expect(screen.getByText("pet friendly")).toBeInTheDocument();
  });

  it("renders the no-pets label when the listing is not pet friendly", () => {
    render(<AmenityIcons {...baseProps} petFriendly={false} />);

    expect(screen.getByText("no pets")).toBeInTheDocument();
    expect(screen.queryByText("pet friendly")).not.toBeInTheDocument();
  });

  it("uses the compact icon size when compact is enabled", () => {
    render(<AmenityIcons {...baseProps} compact />);

    const bedroomsIcon = screen.getByTestId("amenity-icon-bedrooms");
    expect(bedroomsIcon.getAttribute("class")).toContain("h-3.5");
    expect(bedroomsIcon.getAttribute("class")).toContain("w-3.5");
  });

  it("uses the regular icon size when compact is disabled", () => {
    render(<AmenityIcons {...baseProps} />);

    const bedroomsIcon = screen.getByTestId("amenity-icon-bedrooms");
    expect(bedroomsIcon.getAttribute("class")).toContain("h-4");
    expect(bedroomsIcon.getAttribute("class")).toContain("w-4");
  });
});
