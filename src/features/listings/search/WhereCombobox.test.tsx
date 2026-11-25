import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { APARTMENT_LISTINGS } from "../data/demo-listings";
import type { SearchDraft } from "./composer-types";
import { EMPTY_STAY_SEARCH } from "./stay-search";
import { isWherePopupOpen, whereText, WhereCombobox } from "./WhereCombobox";

const EMPTY: SearchDraft = {
  ...EMPTY_STAY_SEARCH,
  location: null,
  locations: [],
  nearby: false,
};
let latest: SearchDraft;

function Harness({ initial = EMPTY }: { initial?: SearchDraft }) {
  const [draft, setDraft] = useState(initial);
  latest = draft;
  return (
    <>
      <WhereCombobox
        draft={draft}
        setDraft={(patch) => setDraft((d) => ({ ...d, ...patch }))}
        listings={APARTMENT_LISTINGS}
      />
      <button onClick={() => setDraft(EMPTY)}>Clear all</button>
    </>
  );
}

const input = () =>
  screen.getByRole("combobox", { name: "Search destinations" });
const type = (text: string) => {
  fireEvent.focus(input());
  fireEvent.change(input(), { target: { value: text } });
};
const key = (name: string) => fireEvent.keyDown(input(), { key: name });
const options = () =>
  within(screen.getByRole("listbox", { name: "Destination suggestions" }))
    .getAllByRole("option")
    .map((option) => option.textContent);

describe("WhereCombobox", () => {
  const scrollIntoView = jest.fn();

  beforeAll(() => {
    // jsdom has no layout, so it does not implement scrollIntoView.
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  beforeEach(() => scrollIntoView.mockClear());

  it("exposes the ARIA 1.2 combobox contract", () => {
    render(<Harness />);
    expect(input()).toHaveAttribute("aria-autocomplete", "list");
    expect(input()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    fireEvent.focus(input());
    const list = screen.getByRole("listbox");
    expect(input()).toHaveAttribute("aria-expanded", "true");
    expect(input()).toHaveAttribute("aria-controls", list.id);
  });

  it("shows counts, with the singular for one stay", () => {
    render(<Harness />);
    type("limon");
    expect(options()).toEqual([
      "Limón1 stay",
      "Barrio Roosevelt, Limón1 stay",
      "Muelle Viejo ApartmentStay",
    ]);
    fireEvent.change(input(), { target: { value: "" } });
    expect(options()[0]).toBe("San José3 stays");
  });

  it("moves the active option with the arrows and wraps", () => {
    render(<Harness />);
    type("limon");
    const active = () =>
      document.getElementById(
        input().getAttribute("aria-activedescendant") ?? "",
      );

    expect(input()).not.toHaveAttribute("aria-activedescendant");
    key("ArrowDown");
    expect(active()).toHaveTextContent("Limón");
    expect(active()).toHaveAttribute("aria-selected", "true");
    key("ArrowDown");
    expect(active()).toHaveTextContent("Barrio Roosevelt");
    key("ArrowUp");
    key("ArrowUp");
    expect(active()).toHaveTextContent("Muelle Viejo");
    key("ArrowDown");
    expect(active()).toHaveTextContent("Limón");
  });

  it("Enter selects the active option and closes the list", () => {
    render(<Harness />);
    type("tamarindo");
    key("ArrowDown");
    key("Enter");
    expect(latest).toMatchObject({
      location: "Guanacaste",
      place: "tamarindo",
      q: "",
    });
    expect(input()).toHaveValue("Tamarindo, Guanacaste");
    expect(input()).toHaveAttribute("aria-expanded", "false");
  });

  it("Enter with no active option keeps the free text", () => {
    render(<Harness />);
    type("tama");
    key("Enter");
    expect(latest).toMatchObject({ q: "tama", place: null, location: null });
  });

  it("selects with the pointer", () => {
    render(<Harness />);
    type("limon");
    fireEvent.click(screen.getByRole("option", { name: /^Limón/ }));
    expect(latest).toMatchObject({ location: "Limón", place: null, q: "" });
    expect(input()).toHaveValue("Limón");
  });

  it("keeps focus in the input when an option is pressed", () => {
    render(<Harness />);
    type("limon");
    const option = screen.getByRole("option", { name: /^Limón/ });
    // fireEvent returns false when the handler called preventDefault.
    expect(fireEvent.mouseDown(option)).toBe(false);
    expect(latest.location).toBeNull(); // only the click selects
  });

  it("scrolls the active option into view", () => {
    render(<Harness />);
    type("a");
    key("ArrowUp");
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.instances[0]).toBe(
      screen.getAllByRole("option").at(-1),
    );
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
  });

  it("a listing writes its province, place and name", () => {
    render(<Harness />);
    type("muelle");
    fireEvent.click(screen.getByRole("option", { name: /Muelle Viejo/ }));
    expect(latest).toMatchObject({
      location: "Limón",
      place: "barrio-roosevelt",
      q: "Muelle Viejo Apartment",
    });
  });

  it("free text keeps the province and clears the place", () => {
    render(
      <Harness
        initial={{ ...EMPTY, location: "Guanacaste", place: "tamarindo" }}
      />,
    );
    expect(input()).toHaveValue("Tamarindo, Guanacaste");
    type("casa");
    expect(latest).toMatchObject({
      q: "casa",
      place: null,
      location: "Guanacaste",
    });
  });

  it("Escape closes the list first, then leaves Escape to the composer", () => {
    render(<Harness />);
    type("limon");
    expect(isWherePopupOpen(input())).toBe(true);
    key("Escape");
    expect(input()).toHaveAttribute("aria-expanded", "false");
    expect(isWherePopupOpen(input())).toBe(false);
  });

  it("closes when focus leaves the widget", () => {
    render(<Harness />);
    type("limon");
    fireEvent.blur(input(), {
      relatedTarget: screen.getByRole("button", { name: "Clear all" }),
    });
    expect(input()).toHaveAttribute("aria-expanded", "false");
  });

  it("shows a helpful empty state whose Clear stays reachable by Tab", () => {
    render(<Harness initial={{ ...EMPTY, location: "Limón" }} />);
    type("xyz");
    expect(screen.getByRole("status")).toHaveTextContent(
      "No places match ‘xyz’",
    );
    expect(input()).toHaveAttribute("aria-expanded", "false");
    expect(isWherePopupOpen(input())).toBe(true);

    const clear = screen.getByRole("button", { name: "Clear" });
    fireEvent.blur(input(), { relatedTarget: clear });
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(latest).toMatchObject({ q: "", place: null, location: null });
    expect(input()).toHaveValue("");
    expect(input()).toHaveFocus();
    expect(options()).toHaveLength(7);
  });

  it("follows Clear all from the composer", () => {
    render(<Harness />);
    type("anything");
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(input()).toHaveValue("");
  });
});

describe("whereText", () => {
  it("prefers q, then the place, then the province", () => {
    expect(whereText(EMPTY)).toBe("");
    expect(whereText({ ...EMPTY, location: "Limón" })).toBe("Limón");
    expect(
      whereText({ ...EMPTY, location: "Guanacaste", place: "tamarindo" }),
    ).toBe("Tamarindo, Guanacaste");
    expect(
      whereText({
        ...EMPTY,
        location: "Guanacaste",
        place: "tamarindo",
        q: "x",
      }),
    ).toBe("x");
  });
});
