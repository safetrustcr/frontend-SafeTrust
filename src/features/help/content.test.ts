import { getArticle } from "./content";
import { HELP_TOPICS } from "./manifest";

describe("getArticle", () => {
  it("returns Markdown for an approved topic", async () => {
    await expect(getArticle(HELP_TOPICS[0])).resolves.toMatch(
      /^# Getting started with SafeTrust/,
    );
  });

  it("rejects an unknown slug with the manifest error", async () => {
    const topic = HELP_TOPICS[0];
    await expect(
      getArticle({ ...topic, slug: "unknown-topic" }),
    ).rejects.toThrow("Help article is not listed in the manifest: unknown-topic");
  });

  it("rejects a listed slug paired with another topic's file", async () => {
    const [topic, otherTopic] = HELP_TOPICS;
    await expect(
      getArticle({ ...topic, file: otherTopic.file }),
    ).rejects.toThrow(
      `Help article is not listed in the manifest: ${topic.slug}`,
    );
  });
});
