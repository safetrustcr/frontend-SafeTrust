import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { HELP_TOPICS } from "./manifest";

const HELP_DIR = fileURLToPath(new URL("../../../docs/help", import.meta.url));
const SLUG_PATTERN = /^[a-z0-9-]+$/;

describe("help manifest", () => {
  it("has unique slugs in lowercase kebab-case", () => {
    const slugs = HELP_TOPICS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug, slug).toMatch(SLUG_PATTERN);
    }
  });

  it("lists only plain files that exist directly inside docs/help", () => {
    for (const topic of HELP_TOPICS) {
      expect(topic.file, topic.slug).not.toContain("/");
      expect(topic.file, topic.slug).not.toContain("\\");
      expect(topic.file, topic.slug).not.toContain("..");

      const full = join(HELP_DIR, topic.file);
      expect(existsSync(full), `missing ${topic.file}`).toBe(true);
      expect(statSync(full).isFile(), topic.file).toBe(true);
    }
  });

  it("points every related slug at a topic that exists", () => {
    const slugs = new Set(HELP_TOPICS.map((t) => t.slug));
    for (const topic of HELP_TOPICS) {
      for (const related of topic.related) {
        expect(slugs.has(related), `${topic.slug} -> ${related}`).toBe(true);
      }
    }
  });
});
