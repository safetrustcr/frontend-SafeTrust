import { render, screen } from "@testing-library/react";
import { UnreadBadge } from "./UnreadBadge";
import { useConversations } from "@/hooks/useConversations";

jest.mock("@/hooks/useConversations", () => ({ useConversations: jest.fn() }));

const withUnread = (...unreadFor: string[][]) =>
  (useConversations as jest.Mock).mockReturnValue({
    currentUserId: "u-1",
    data: unreadFor.map((ids) => ({ unreadFor: ids })),
  });

describe("UnreadBadge", () => {
  it("counts conversations unread for the current user", () => {
    withUnread(["u-1"], [], ["u-2"], ["u-1"]);
    render(<UnreadBadge />);

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("unread conversations")).toBeInTheDocument();
  });

  it("renders nothing when nothing is unread", () => {
    withUnread([], ["u-2"]);
    const { container } = render(<UnreadBadge />);

    expect(container).toBeEmptyDOMElement();
  });

  it("caps the count at 99+", () => {
    withUnread(...Array.from({ length: 120 }, () => ["u-1"]));
    render(<UnreadBadge />);

    expect(screen.getByText("99+")).toBeInTheDocument();
  });
});
