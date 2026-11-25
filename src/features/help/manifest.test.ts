import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { HELP_TOPICS } from "./manifest";

const HELP_DIR = join(__dirname, "../../../docs/help");
const SLUG_PATTERN = /^[a-z0-9-]+$/;

describe("help manifest", () => {
  it("has unique slugs in lowercase kebab-case", () => {
    const slugs = HELP_TOPICS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(SLUG_PATTERN);
    }
  });

  it("lists only plain files that exist directly inside docs/help", () => {
    for (const topic of HELP_TOPICS) {
      expect(topic.file).not.toContain("/");
      expect(topic.file).not.toContain("\\");
      expect(topic.file).not.toContain("..");

      const full = join(HELP_DIR, topic.file);
      expect(existsSync(full)).toBe(true);
      expect(statSync(full).isFile()).toBe(true);
    }
  });

  it("points every related slug at a topic that exists", () => {
    const slugs = new Set(HELP_TOPICS.map((t) => t.slug));
    for (const topic of HELP_TOPICS) {
      for (const related of topic.related) {
        expect(slugs.has(related)).toBe(true);
      }
    }
  });
});
