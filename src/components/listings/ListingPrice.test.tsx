import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { ListingPrice } from "./ListingPrice";

describe("ListingPrice (SD-00)", () => {
  it("renders formatted amount and '/ night' suffix", () => {
    render(<ListingPrice amount={1500} />);

    expect(screen.getByText("$1,500")).toBeInTheDocument();
    expect(screen.getByText("/ night")).toBeInTheDocument();
  });

  it("does not render any fee, total, rating or cancellation text", () => {
    const { container } = render(<ListingPrice amount={2500} size="sm" />);

    expect(container.textContent).toBe("$2,500/ night");
    expect(screen.queryByText(/total/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/fee/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/cancellation/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/rating/i)).not.toBeInTheDocument();
  });

  it("applies the appropriate size styling", () => {
    const { rerender } = render(<ListingPrice amount={3200} size="sm" />);
    expect(screen.getByText("$3,200")).toHaveClass("text-base");

    rerender(<ListingPrice amount={3200} size="lg" />);
    expect(screen.getByText("$3,200")).toHaveClass("text-2xl");
  });
});
