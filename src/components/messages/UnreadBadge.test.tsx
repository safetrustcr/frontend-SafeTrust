import { render, screen } from "@testing-library/react";
import { UnreadBadge } from "./UnreadBadge";

describe("UnreadBadge", () => {
  it("renders the stub unread count when a user id is provided", () => {
    render(<UnreadBadge userId="test-user-1" />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders nothing when user id is omitted", () => {
    const { container } = render(<UnreadBadge />);

    expect(container).toBeEmptyDOMElement();
  });
});
