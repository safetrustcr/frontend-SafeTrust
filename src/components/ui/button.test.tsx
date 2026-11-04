import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { render, screen } from "@testing-library/react";
import { Button, buttonVariants } from "./button";

describe("Button", () => {
  it("uses the action tokens for the default variant", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });

    expect(button).toHaveClass("bg-action", "text-action-foreground");
    expect(button).toHaveClass("border-action-border", "font-semibold");
  });

  it("gives outline an orange border and text in dark mode", () => {
    expect(buttonVariants({ variant: "outline" })).toEqual(
      expect.stringContaining("dark:border-orange-700"),
    );
    expect(buttonVariants({ variant: "outline" })).toEqual(
      expect.stringContaining("dark:text-orange-300"),
    );
  });

  it("uses a 2px offset focus ring on every variant", () => {
    const variants = [
      "default",
      "outline",
      "secondary",
      "ghost",
      "link",
      "destructive",
    ] as const;

    for (const variant of variants) {
      const classes = buttonVariants({ variant }).split(" ");
      expect(classes).toEqual(
        expect.arrayContaining([
          "focus-visible:ring-2",
          "focus-visible:ring-ring",
          "focus-visible:ring-offset-2",
          "focus-visible:ring-offset-background",
        ]),
      );
    }
  });

  it("keeps asChild rendering the child element", () => {
    render(
      <Button asChild>
        <Link href="/rent">Browse</Link>
      </Button>,
    );

    expect(screen.getByRole("link", { name: "Browse" })).toHaveClass(
      "bg-action",
    );
  });

  it.each(["button.tsx", "icon-button.tsx"])(
    "%s has no sky or blue classes",
    (file) => {
      const source = readFileSync(join(__dirname, file), "utf8");
      expect(source).not.toMatch(/\b(sky|blue)-\d/);
    },
  );
});
