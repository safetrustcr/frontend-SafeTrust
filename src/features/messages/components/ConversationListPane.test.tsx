import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { useConversations } from "../hooks/useConversations";
import { ConversationListPane } from "./ConversationListPane";
import { MessagesArea } from "./MessagesArea";

jest.mock("next/navigation", () => ({ usePathname: () => "/" }));
jest.mock("../hooks/useConversations", () => ({ useConversations: jest.fn() }));

const person = (id: string, first_name: string) => ({
  id,
  first_name,
  last_name: "X",
});
const conversation = (id: string, guestId: string, hostId: string) => ({
  id,
  last_message_at: null,
  listing: { id, name: `Stay ${id}` },
  guest: person(guestId, `Guest${id}`),
  host: person(hostId, `Host${id}`),
  messages: [],
  unreadFor: [],
});

beforeEach(() => {
  (useConversations as jest.Mock).mockReturnValue({
    data: [
      conversation("1", "me", "host-a"), // I'm the guest
      conversation("2", "guest-b", "me"), // I'm the host
    ],
    currentUserId: "me",
    source: "demo",
    loading: false,
  });
});

describe("ConversationListPane", () => {
  it("lists every conversation in the dashboard inbox", () => {
    render(<ConversationListPane />);

    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("lists only conversations with hosts in the guest inbox", () => {
    render(
      <MessagesArea base="/guest/messages" guestOnly>
        <ConversationListPane />
      </MessagesArea>,
    );

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/guest/messages/1");
  });
});
