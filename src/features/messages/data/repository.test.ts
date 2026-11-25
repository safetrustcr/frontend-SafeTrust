import { getListing } from "@/features/listings";
import { demoConversationStore, demoMessages } from "./demo";
import { liveMessages } from "./live";

const uid = "guest-1";

describe("messages repositories", () => {
  beforeEach(() => demoConversationStore.setState({ started: {}, read: {} }));

  it("demo includes the sample threads; the live stub does not", () => {
    expect(demoMessages.source).toBe("demo");
    expect(demoMessages.listConversations(uid).length).toBeGreaterThan(0);
    expect(liveMessages.source).toBe("none");
    expect(liveMessages.listConversations(uid)).toEqual([]);
  });

  it("returns the same array until the store changes", () => {
    const first = demoMessages.listConversations(uid);
    expect(demoMessages.listConversations(uid)).toBe(first);

    demoMessages.markRead(uid, first[0].id);
    const second = demoMessages.listConversations(uid);
    expect(second).not.toBe(first);
    expect(second[0].unreadFor).toEqual([]);
  });

  it("returns no conversations when signed out", () => {
    expect(demoMessages.listConversations("")).toEqual([]);
  });

  it("notifies subscribers and lists a started conversation in both modes", () => {
    const onChange = jest.fn();
    const unsubscribe = liveMessages.subscribe(onChange);

    const id = liveMessages.startConversation(uid, getListing("4")!);
    unsubscribe();

    expect(id).toBe("demo-4-guest-1");
    expect(onChange).toHaveBeenCalled();
    expect(liveMessages.listConversations(uid).map((c) => c.id)).toEqual([id]);
    expect(demoMessages.listConversations(uid)[0].id).toBe(id);
  });

  it("lists a sample listing started outside demo mode, without the sample messages", () => {
    const id = liveMessages.startConversation(uid, getListing("2")!);

    const [conversation] = liveMessages.listConversations(uid);
    expect(conversation.id).toBe(id);
    expect(conversation.unreadFor).toEqual([]);
    expect(liveMessages.listMessages(uid, id)).toEqual([]);
  });

  it("does not duplicate a sample thread started in demo mode", () => {
    const before = demoMessages.listConversations(uid).map((c) => c.id);
    demoMessages.startConversation(uid, getListing("2")!);

    expect(demoMessages.listConversations(uid).map((c) => c.id)).toEqual(
      before,
    );
  });
});
