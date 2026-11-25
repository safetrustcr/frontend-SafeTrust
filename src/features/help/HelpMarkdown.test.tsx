import { render, screen } from "@testing-library/react";
import { HelpMarkdown } from "./HelpMarkdown";

describe("HelpMarkdown", () => {
  it("renders Markdown and suppresses raw HTML", () => {
    const { container } = render(
      <HelpMarkdown
        source={`## Getting started

**Browse listings** to find a place.

<div data-raw-html="true">This raw HTML should not render.</div>`}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Getting started" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Browse listings")).toBeInTheDocument();
    expect(container.querySelector("[data-raw-html]")).not.toBeInTheDocument();
    expect(screen.queryByText("This raw HTML should not render.")).toBeNull();
  });
});
