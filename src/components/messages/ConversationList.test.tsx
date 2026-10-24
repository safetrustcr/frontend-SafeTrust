import { render, screen } from "@testing-library/react";
import { ConversationList } from "./ConversationList";
import { getDemoConversations } from "@/lib/demo/messages";

jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/messages",
}));

describe("ConversationList", () => {
  const currentUserId = "test-user";
  const conversations = getDemoConversations(currentUserId, {
    includeSamples: true,
  });

  it("renders the sample conversations with listing names", () => {
    render(
      <ConversationList
        conversations={conversations}
        currentUserId={currentUserId}
      />,
    );

    for (const conversation of conversations) {
      expect(screen.getByText(conversation.listing.name)).toBeInTheDocument();
    }
  });

  it("links each conversation to its thread route", () => {
    render(
      <ConversationList
        conversations={conversations}
        currentUserId={currentUserId}
      />,
    );

    const [first] = conversations;
    expect(
      screen.getByRole("link", { name: new RegExp(first.listing.name, "i") }),
    ).toHaveAttribute("href", `/dashboard/messages/${first.id}`);
  });
});
