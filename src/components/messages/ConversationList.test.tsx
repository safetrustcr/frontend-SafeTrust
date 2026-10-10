import { render, screen } from "@testing-library/react";
import { ConversationList } from "./ConversationList";
import { getDemoConversations } from "@/lib/demo/messages";

jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/messages",
}));

describe("ConversationList", () => {
  const currentUserId = "test-user";
  const conversations = getDemoConversations(currentUserId);

  it("renders the three stub conversations with apartment names", () => {
    render(
      <ConversationList
        conversations={conversations}
        currentUserId={currentUserId}
      />,
    );

    expect(screen.getByText("Downtown Loft Apartment")).toBeInTheDocument();
    expect(screen.getByText("Seaside Condo")).toBeInTheDocument();
    expect(screen.getByText("Cozy Cabin")).toBeInTheDocument();
  });

  it("links each conversation to its thread route", () => {
    render(
      <ConversationList
        conversations={conversations}
        currentUserId={currentUserId}
      />,
    );

    expect(
      screen.getByRole("link", { name: /downtown loft apartment/i }),
    ).toHaveAttribute("href", "/dashboard/messages/conv-1");
  });
});
