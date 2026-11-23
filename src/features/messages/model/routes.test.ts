import { conversationHref } from "./routes";

describe("conversationHref", () => {
  it("builds the thread route under /dashboard/messages", () => {
    expect(conversationHref("demo-4-guest-1")).toBe(
      "/dashboard/messages/demo-4-guest-1",
    );
  });
});
