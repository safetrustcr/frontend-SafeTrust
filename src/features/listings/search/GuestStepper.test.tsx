import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { GuestStepper } from "./GuestStepper";

describe("GuestStepper", () => {
  it("renders label, hint, and initial value", () => {
    render(
      <GuestStepper
        label="Adults"
        hint="Ages 13 or above"
        value={2}
        max={16}
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByText("Adults")).toBeInTheDocument();
    expect(screen.getByText("Ages 13 or above")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("2");
  });

  it("disables decrease button when value is 0 and enables when value > 0", () => {
    const { rerender } = render(
      <GuestStepper label="Children" value={0} max={5} onChange={jest.fn()} />,
    );

    const decBtn = screen.getByRole("button", { name: "Decrease children" });
    const incBtn = screen.getByRole("button", { name: "Increase children" });

    expect(decBtn).toBeDisabled();
    expect(incBtn).toBeEnabled();

    rerender(
      <GuestStepper label="Children" value={1} max={5} onChange={jest.fn()} />,
    );
    expect(decBtn).toBeEnabled();
  });

  it("disables increase button when value reaches max", () => {
    render(
      <GuestStepper label="Pets" value={5} max={5} onChange={jest.fn()} />,
    );

    const incBtn = screen.getByRole("button", { name: "Increase pets" });
    expect(incBtn).toBeDisabled();
  });

  it("fires onChange when buttons are clicked", () => {
    const onChange = jest.fn();
    render(
      <GuestStepper label="Adults" value={2} max={10} onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Decrease adults" }));
    expect(onChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole("button", { name: "Increase adults" }));
    expect(onChange).toHaveBeenCalledWith(3);
  });
});
