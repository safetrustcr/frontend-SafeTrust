import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { notFound } from "next/navigation";
import { ConversationView } from "./ConversationView";
import { useConversation } from "@/hooks/useConversation";

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));
jest.mock("@/hooks/useConversation", () => ({ useConversation: jest.fn() }));
jest.mock("./ConversationThread", () => ({
  ConversationThread: () => <div data-testid="thread" />,
}));

const conversation = {
  id: "demo-4-guest-1",
  listing: { id: "4", name: "Jardín de Heredia House" },
  host: { id: "demo-host-4", first_name: "Laura", last_name: "Mora" },
  guest: { id: "guest-1", first_name: "Demo", last_name: "guest" },
};

const state = (overrides: Record<string, unknown>) =>
  (useConversation as jest.Mock).mockReturnValue({
    conversation: null,
    messages: [],
    source: "demo",
    currentUserId: "",
    loading: false,
    appendMessage: jest.fn(),
    markRead: jest.fn(),
    ...overrides,
  });

describe("ConversationView", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows a skeleton, not a 404, while auth is loading", () => {
    state({ loading: true });
    render(<ConversationView conversationId={conversation.id} />);

    expect(
      screen.getByRole("status", { name: "Loading conversation" }),
    ).toBeInTheDocument();
    expect(notFound).not.toHaveBeenCalled();
  });

  it("404s a missing conversation", () => {
    state({ currentUserId: "guest-1" });
    expect(() =>
      render(<ConversationView conversationId="demo-999-guest-1" />),
    ).toThrow("NEXT_NOT_FOUND");
  });

  it("404s someone else's conversation the same way", () => {
    state({ conversation, currentUserId: "intruder" });
    expect(() =>
      render(<ConversationView conversationId={conversation.id} />),
    ).toThrow("NEXT_NOT_FOUND");
  });

  it("shows the host and listing to the guest, with a back link", () => {
    state({ conversation, currentUserId: "guest-1" });
    render(<ConversationView conversationId={conversation.id} />);

    const heading = screen.getByRole("heading", { name: "Laura Mora" });
    expect(heading).toHaveFocus();
    expect(
      screen.getByRole("link", { name: conversation.listing.name }),
    ).toHaveAttribute("href", "/rent/4");
    expect(
      screen.getByRole("link", { name: /back to messages/i }),
    ).toHaveAttribute("href", "/dashboard/messages");
    expect(screen.getByText("Demo")).toBeInTheDocument();
  });

  it("shows the guest to the host", () => {
    state({ conversation, currentUserId: "demo-host-4" });
    render(<ConversationView conversationId={conversation.id} />);

    expect(
      screen.getByRole("heading", { name: "Demo guest" }),
    ).toBeInTheDocument();
  });
});
