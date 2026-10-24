import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PageContainer } from "@/components/layouts/PageContainer";
import {
  HELP_ARTICLES,
  getHelpArticle,
  helpPath,
  resolveReturnPath,
} from "@/features/help/articles";

// Only the published guides exist; any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return HELP_ARTICLES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const article = getHelpArticle((await params).slug);
  return article
    ? {
        title: `${article.title} | SafeTrust Help`,
        description: article.summary,
      }
    : {};
}

export default async function HelpArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const article = getHelpArticle((await params).slug);
  if (!article) notFound();

  const returnPath = resolveReturnPath((await searchParams).from);

  return (
    <PageContainer width="narrow" className="py-10 sm:py-14">
      <main>
        <nav
          aria-label="Help navigation"
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium"
        >
          <Link
            href={returnPath}
            className="inline-flex items-center gap-2 text-orange-700 hover:underline dark:text-orange-400"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to rentals
          </Link>
          <Link
            href={helpPath("/help", returnPath)}
            className="text-muted-foreground hover:text-foreground hover:underline"
          >
            All guides
          </Link>
        </nav>

        <article className="mt-6">
          <h1 className="text-3xl font-semibold text-foreground">
            {article.title}
          </h1>
          <p className="mt-2 text-muted-foreground">{article.summary}</p>

          {article.sections.map((section) => (
            <section key={section.heading} className="mt-8">
              <h2 className="text-lg font-semibold text-foreground">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-2 leading-relaxed text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </article>
      </main>
    </PageContainer>
  );
}
