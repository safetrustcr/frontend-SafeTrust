import { APARTMENT_LISTINGS } from "@/lib/mockData/apartmentListings";
import {
  demoConversationId,
  demoConversationStore,
  ensureDemoConversation,
  getDemoConversations,
  markDemoConversationRead,
} from "./messages";

const uid = "guest-1";
const listing = (id: string) => APARTMENT_LISTINGS.find((l) => l.id === id)!;
const conversationsFor = (user: string, includeSamples = false) => {
  const { started, read } = demoConversationStore.getState();
  return getDemoConversations(user, {
    includeSamples,
    started: started[user],
    read: read[user],
  });
};

describe("demo conversations", () => {
  beforeEach(() => demoConversationStore.setState({ started: {}, read: {} }));

  it("builds a stable id from the listing id and guest uid", () => {
    expect(demoConversationId("4", uid)).toBe("demo-4-guest-1");
  });

  it("keys a started conversation by listing id, not by name", () => {
    ensureDemoConversation(uid, { ...listing("4"), name: "Renamed listing" });

    const [conversation] = conversationsFor(uid);
    expect(conversation.id).toBe(demoConversationId("4", uid));
    expect(conversation.listing).toEqual({
      id: "4",
      name: listing("4").name,
    });
    expect(conversation.host.id).toBe("demo-host-4");
    expect(conversation.guest.id).toBe(uid);
  });

  it("starts each conversation once", () => {
    ensureDemoConversation(uid, listing("4"));
    ensureDemoConversation(uid, listing("4"));
    expect(conversationsFor(uid)).toHaveLength(1);
  });

  it("keeps conversations per user", () => {
    ensureDemoConversation(uid, listing("4"));
    expect(conversationsFor("guest-2")).toEqual([]);
  });

  it("only includes sample threads in demo mode", () => {
    expect(conversationsFor(uid, false)).toEqual([]);
    expect(conversationsFor(uid, true).length).toBeGreaterThan(0);
  });

  it("marks a sample thread read once opened", () => {
    const [sample] = conversationsFor(uid, true);
    expect(sample.unreadFor).toEqual([uid]);

    markDemoConversationRead(uid, sample.id);
    const reopened = conversationsFor(uid, true).find(
      (c) => c.id === sample.id,
    )!;
    expect(reopened.unreadFor).toEqual([]);
  });
});
