import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { SortMenu } from "./SortMenu";

describe("SortMenu", () => {
  it("renders with current sort label", () => {
    render(<SortMenu value="relevance" onChange={jest.fn()} />);

    expect(
      screen.getByRole("button", { name: /Sort by:\s*Relevance/i }),
    ).toBeInTheDocument();
  });

  it("opens options popover and triggers onChange when option is clicked", () => {
    const handleChange = jest.fn();
    render(<SortMenu value="relevance" onChange={handleChange} />);

    const trigger = screen.getByRole("button", {
      name: /Sort by:\s*Relevance/i,
    });
    fireEvent.click(trigger);

    expect(
      screen.getByRole("group", { name: "Sort results" }),
    ).toBeInTheDocument();
    const lowToHigh = screen.getByRole("button", {
      name: "Price: Low to High",
    });
    expect(lowToHigh).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Relevance" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    fireEvent.click(lowToHigh);
    expect(handleChange).toHaveBeenCalledWith("price-low");
  });

  it("does not show Nearest option when canSortByDistance is false", () => {
    render(
      <SortMenu
        value="relevance"
        onChange={jest.fn()}
        canSortByDistance={false}
      />,
    );

    const trigger = screen.getByRole("button", {
      name: /Sort by:\s*Relevance/i,
    });
    fireEvent.click(trigger);

    expect(
      screen.queryByRole("button", { name: "Nearest" }),
    ).not.toBeInTheDocument();
  });

  it("shows Nearest option when canSortByDistance is true", () => {
    render(
      <SortMenu
        value="relevance"
        onChange={jest.fn()}
        canSortByDistance={true}
      />,
    );

    const trigger = screen.getByRole("button", {
      name: /Sort by:\s*Relevance/i,
    });
    fireEvent.click(trigger);

    expect(screen.getByRole("button", { name: "Nearest" })).toBeInTheDocument();
  });

  it("highlights the currently selected sort option", () => {
    render(<SortMenu value="price-high" onChange={jest.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: /Sort by:\s*Price: High to Low/i }),
    );

    expect(
      screen.getByRole("button", { name: "Price: High to Low" }),
    ).toHaveClass("bg-accent");
  });
});
