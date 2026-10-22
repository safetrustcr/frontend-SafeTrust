import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import type { HelpTopic } from "./manifest";
import type { HelpHeading } from "./markdown-headings";
import { getTopic } from "./content";
import { BackToRentals } from "./BackToRentals";
import { HelpHeader } from "./HelpHeader";
import { HelpTopicLink } from "./HelpTopicLink";
import { PageContainer } from "@/components/layouts/PageContainer";

function TopicLinkFallback({
  topic,
  className,
  children,
}: {
  topic: Pick<HelpTopic, "slug">;
  className: string;
  children: ReactNode;
}) {
  return (
    <Link href={`/help/${topic.slug}`} className={className}>
      {children}
    </Link>
  );
}

export function HelpArticleLayout({
  topic,
  headings,
  children,
}: {
  topic: HelpTopic;
  headings: HelpHeading[];
  children: ReactNode;
}) {
  const relatedTopics = topic.related
    .map((slug) => getTopic(slug))
    .filter((related): related is HelpTopic => related !== undefined);

  return (
    <>
      <HelpHeader />
      <main>
        <PageContainer className="py-8 sm:py-10">
          <nav aria-label="Breadcrumb" className="mb-8 text-sm">
            <ol className="flex flex-wrap items-center gap-2 text-muted-foreground">
              <li>
                <Link
                  href="/help"
                  className="font-medium text-primary hover:underline"
                >
                  Help
                </Link>
              </li>
              <li aria-hidden="true">›</li>
              <li aria-current="page" className="text-foreground">
                {topic.title}
              </li>
            </ol>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
            <article className="min-w-0 max-w-prose">
              <header className="mb-8 border-b border-border pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {topic.title}
                </h1>
                <p className="mt-3 text-muted-foreground">
                  {topic.description}
                </p>
              </header>
              {children}

              {relatedTopics.length > 0 && (
                <section
                  aria-labelledby="related-topics-heading"
                  className="mt-12 border-t border-border pt-8"
                >
                  <h2
                    id="related-topics-heading"
                    className="text-xl font-semibold text-foreground"
                  >
                    Related topics
                  </h2>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {relatedTopics.map((related) => (
                      <li key={related.slug}>
                        <Suspense
                          fallback={
                            <TopicLinkFallback
                              topic={related}
                              className="block h-full rounded-xl border border-border bg-card p-4"
                            >
                              <span className="font-semibold text-foreground">
                                {related.title}
                              </span>
                              <span className="mt-1 block text-sm text-muted-foreground">
                                {related.description}
                              </span>
                            </TopicLinkFallback>
                          }
                        >
                          <HelpTopicLink
                            topic={related}
                            className="block h-full rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-muted"
                          >
                            <span className="font-semibold text-foreground">
                              {related.title}
                            </span>
                            <span className="mt-1 block text-sm text-muted-foreground">
                              {related.description}
                            </span>
                          </HelpTopicLink>
                        </Suspense>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </article>

            {headings.length > 0 && (
              <aside className="lg:sticky lg:top-24">
                <details className="rounded-xl border border-border bg-card p-4 lg:hidden">
                  <summary className="cursor-pointer font-semibold text-foreground">
                    On this page
                  </summary>
                  <HeadingLinks headings={headings} className="mt-3" />
                </details>
                <nav
                  aria-label="On this page"
                  className="hidden rounded-xl border border-border bg-card p-4 lg:block"
                >
                  <h2 className="font-semibold text-foreground">On this page</h2>
                  <HeadingLinks headings={headings} className="mt-3" />
                </nav>
              </aside>
            )}
          </div>

          <div className="mt-12 border-t border-border pt-6">
            <Suspense
              fallback={
                <Link
                  href="/rent"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground"
                >
                  Back to rentals
                </Link>
              }
            >
              <BackToRentals />
            </Suspense>
          </div>
        </PageContainer>
      </main>
    </>
  );
}

function HeadingLinks({
  headings,
  className,
}: {
  headings: HelpHeading[];
  className?: string;
}) {
  return (
    <ul className={className}>
      {headings.map((heading) => (
        <li
          key={heading.id}
          className={heading.depth === 3 ? "ml-3" : undefined}
        >
          <Link
            href={`#${heading.id}`}
            className="block py-1 text-sm text-muted-foreground hover:text-primary"
          >
            {heading.text}
          </Link>
        </li>
      ))}
    </ul>
  );
}
