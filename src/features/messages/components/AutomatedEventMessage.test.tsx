import { render, screen } from "@testing-library/react";
import { AutomatedEventMessage } from "./AutomatedEventMessage";

const message = {
  id: "1",
  body: "Milestone approved",
  created_at: "2026-01-15T00:00:00.000Z",
};

describe("AutomatedEventMessage", () => {
  it("uses the info token for approved milestones", () => {
    const { container } = render(
      <AutomatedEventMessage
        message={{ ...message, event_type: "milestone_approved" }}
      />,
    );

    expect(container.firstChild).toHaveClass("bg-info/10", "border-info/20");
    expect(container.querySelector("svg")).toHaveClass("text-info");
  });

  it("keeps its text on theme tokens", () => {
    render(
      <AutomatedEventMessage message={{ ...message, event_type: null }} />,
    );

    expect(screen.getByText("Milestone approved")).toHaveClass(
      "text-foreground",
    );
  });

  it("falls back to the neutral style for unknown events", () => {
    const { container } = render(
      <AutomatedEventMessage message={{ ...message, event_type: "unknown" }} />,
    );

    expect(container.firstChild).toHaveClass("bg-muted", "border-border");
  });
});
