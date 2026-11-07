import { render, screen } from "@testing-library/react";
import DestinationCarousel from "./DestinationCarousel";

jest.mock("@/features/listings", () => ({
  listDestinations: () => [
    { location: "Heredia", imageUrl: "/img/destinations/heredia.webp" },
  ],
  useListings: () => [{ location: "Heredia" }, { location: "Heredia" }],
}));

describe("DestinationCarousel", () => {
  it("links each destination with its photo and stay count", () => {
    const { container } = render(<DestinationCarousel />);

    const link = screen.getByRole("link", { name: /Heredia/ });
    expect(link).toHaveAttribute("href", "/rent");
    expect(link).toHaveTextContent("2 stays");
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      expect.stringContaining("heredia.webp"),
    );
  });
});
