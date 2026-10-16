import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { ListingPrice, LISTING_PRICE_UNIT } from "./ListingPrice";

describe("ListingPrice", () => {
  it("renders amount and / night unit", () => {
    render(<ListingPrice amount={86} />);

    expect(screen.getByText("$86")).toBeInTheDocument();
    expect(screen.getByText(`/ ${LISTING_PRICE_UNIT}`)).toBeInTheDocument();
  });

  it("supports sm, md, and lg sizes", () => {
    const { rerender } = render(<ListingPrice amount={100} size="sm" />);
    expect(screen.getByText("$100")).toHaveClass("text-sm");

    rerender(<ListingPrice amount={100} size="md" />);
    expect(screen.getByText("$100")).toHaveClass("text-2xl");

    rerender(<ListingPrice amount={100} size="lg" />);
    expect(screen.getByText("$100")).toHaveClass("text-3xl");
  });

  it("applies additional custom className", () => {
    const { container } = render(
      <ListingPrice amount={50} className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
