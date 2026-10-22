import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HelpArticleLayout } from "@/features/help/HelpArticleLayout";
import {
  getArticle,
  getTopic,
  HELP_TOPICS,
  HelpMarkdown,
} from "@/features/help";
import { extractHelpHeadings } from "@/features/help/markdown-headings";

export const dynamicParams = false;

export function generateStaticParams() {
  return HELP_TOPICS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const topic = getTopic((await params).slug);
  return topic
    ? {
        title: `${topic.title} · Help`,
        description: topic.description,
      }
    : {};
}

export default async function HelpArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const topic = getTopic((await params).slug);
  if (!topic) notFound();

  const markdown = await getArticle(topic);
  const headings = extractHelpHeadings(markdown).filter(
    (heading) => heading.depth === 2,
  );

  return (
    <HelpArticleLayout topic={topic} headings={headings}>
      <HelpMarkdown source={markdown} />
    </HelpArticleLayout>
  );
}
