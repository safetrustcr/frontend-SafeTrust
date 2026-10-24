import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

function HelpDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button type="button">Help &amp; docs</button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle>Help &amp; docs</SheetTitle>
        <SheetDescription>Quick guides for the rent page.</SheetDescription>
        <p>Panel body</p>
        <SheetClose asChild>
          <button type="button">Done</button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}

describe("Sheet primitive", () => {
  it("opens and closes through the trigger and an explicit SheetClose", () => {
    render(<HelpDemo />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Help & docs" }));
    expect(screen.getByRole("dialog")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("announces the panel through its title as 'Help & docs, dialog'", () => {
    render(<HelpDemo />);
    fireEvent.click(screen.getByRole("button", { name: "Help & docs" }));

    expect(screen.getByRole("dialog", { name: "Help & docs" })).toBeVisible();
    expect(
      screen.getByText("Quick guides for the rent page."),
    ).toBeInTheDocument();
  });

  it("provides exactly one accessible close button", () => {
    render(<HelpDemo />);
    fireEvent.click(screen.getByRole("button", { name: "Help & docs" }));

    expect(screen.getAllByRole("button", { name: "Close" })).toHaveLength(1);
  });

  it("closes on Escape and restores focus to the trigger", async () => {
    render(<HelpDemo />);
    const trigger = screen.getByRole("button", { name: "Help & docs" });
    // jsdom's fireEvent.click does not move focus, so emulate the focused
    // trigger a real browser produces before Radix snapshots it.
    trigger.focus();
    fireEvent.click(trigger);

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    // Radix restores focus in a queued task after unmount.
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("disables open/close animations under reduced motion", () => {
    render(<HelpDemo />);
    fireEvent.click(screen.getByRole("button", { name: "Help & docs" }));

    for (const layer of [
      screen.getByRole("dialog"),
      screen.getByRole("dialog").previousElementSibling as Element,
    ]) {
      expect(layer.className).toContain("motion-reduce:animate-none");
    }
  });

  it("ports the panel outside the React tree against the body", () => {
    const { container } = render(<HelpDemo />);
    fireEvent.click(screen.getByRole("button", { name: "Help & docs" }));

    const dialog = screen.getByRole("dialog");
    expect(container.contains(dialog)).toBe(false);
    expect(document.body.contains(dialog)).toBe(true);
  });
});
