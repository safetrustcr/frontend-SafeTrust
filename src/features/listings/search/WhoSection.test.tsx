import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { WhoSection } from "./WhoSection";
import { ANY_GUESTS } from "./stay-search";

describe("WhoSection", () => {
  it("renders all 4 steppers without alert when counts are 0", () => {
    render(<WhoSection guests={ANY_GUESTS} onChange={jest.fn()} />);

    expect(screen.getByText("Adults")).toBeInTheDocument();
    expect(screen.getByText("Children")).toBeInTheDocument();
    expect(screen.getByText("Infants")).toBeInTheDocument();
    expect(screen.getByText("Pets")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows 'Add at least one adult' alert when children, infants, or pets > 0 without adults", () => {
    const { rerender } = render(
      <WhoSection
        guests={{ adults: 0, children: 1, infants: 0, pets: 0 }}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Add at least one adult",
    );

    rerender(
      <WhoSection
        guests={{ adults: 0, children: 0, infants: 1, pets: 0 }}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Add at least one adult",
    );

    rerender(
      <WhoSection
        guests={{ adults: 0, children: 0, infants: 0, pets: 1 }}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Add at least one adult",
    );

    rerender(
      <WhoSection
        guests={{ adults: 1, children: 1, infants: 1, pets: 1 }}
        onChange={jest.fn()}
      />,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("propagates onChange correctly for each category", () => {
    const onChange = jest.fn();
    render(
      <WhoSection
        guests={{ adults: 2, children: 1, infants: 0, pets: 0 }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Increase adults" }));
    expect(onChange).toHaveBeenCalledWith({
      adults: 3,
      children: 1,
      infants: 0,
      pets: 0,
    });

    fireEvent.click(screen.getByRole("button", { name: "Increase children" }));
    expect(onChange).toHaveBeenCalledWith({
      adults: 2,
      children: 2,
      infants: 0,
      pets: 0,
    });

    fireEvent.click(screen.getByRole("button", { name: "Increase infants" }));
    expect(onChange).toHaveBeenCalledWith({
      adults: 2,
      children: 1,
      infants: 1,
      pets: 0,
    });

    fireEvent.click(screen.getByRole("button", { name: "Increase pets" }));
    expect(onChange).toHaveBeenCalledWith({
      adults: 2,
      children: 1,
      infants: 0,
      pets: 1,
    });
  });

  it("enforces party limit (16) across adults and children", () => {
    render(
      <WhoSection
        guests={{ adults: 10, children: 6, infants: 0, pets: 0 }}
        onChange={jest.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Increase adults" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Increase children" }),
    ).toBeDisabled();
  });
});
