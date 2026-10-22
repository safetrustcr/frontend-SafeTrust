import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { HELP_TOPICS, type HelpTopic } from "./manifest";

const HELP_DIR = path.join(process.cwd(), "docs", "help");

export function getTopic(slug: string): HelpTopic | undefined {
  return HELP_TOPICS.find((topic) => topic.slug === slug);
}

export async function getArticle(topic: HelpTopic): Promise<string> {
  const allowedTopic = HELP_TOPICS.find(
    (candidate) =>
      candidate.slug === topic.slug && candidate.file === topic.file,
  );

  if (!allowedTopic) {
    throw new Error(`Help article is not listed in the manifest: ${topic.slug}`);
  }

  return readFile(path.join(HELP_DIR, allowedTopic.file), "utf8");
}
