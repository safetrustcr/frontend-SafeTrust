import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { PageContainer } from "@/components/layouts/PageContainer";
import { HelpHeader } from "@/features/help/HelpHeader";
import { HelpTopicLink } from "@/features/help/HelpTopicLink";
import { HELP_TOPICS, type HelpTopic } from "@/features/help/manifest";
import { safeRentReturn } from "@/features/help/return-target";

const HELP_TOPICS_VIEW: readonly HelpTopic[] = HELP_TOPICS;

export const metadata: Metadata = {
  title: "Help & docs",
  description:
    "Guides for finding a rental, hosting a place, and understanding SafeTrust payments.",
};

const PAYMENT_TOPIC_SLUGS = new Set(["escrow-explained", "troubleshooting"]);

const HELP_GROUPS: { title: string; topics: HelpTopic[] }[] = [
  {
    title: "Guests",
    topics: HELP_TOPICS_VIEW.filter(
      (topic) =>
        topic.audience === "guest" ||
        (topic.audience === "everyone" &&
          !PAYMENT_TOPIC_SLUGS.has(topic.slug)),
    ),
  },
  {
    title: "Hosts",
    topics: HELP_TOPICS_VIEW.filter((topic) => topic.audience === "host"),
  },
  {
    title: "Payments & escrow",
    topics: HELP_TOPICS_VIEW.filter(
      (topic) =>
        PAYMENT_TOPIC_SLUGS.has(topic.slug) &&
        !HELP_TOPICS_VIEW.some(
          (other) =>
            other.slug === topic.slug &&
            (other.audience === "guest" || other.audience === "host"),
        ),
    ),
  },
];

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

export default async function HelpIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const { from } = await searchParams;
  const returnPath = safeRentReturn(Array.isArray(from) ? from[0] : from);

  return (
    <>
      <HelpHeader returnPath={returnPath} />
      <main>
        <PageContainer className="py-10 sm:py-14">
          <header className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              SafeTrust support
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Help &amp; docs
            </h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Clear guides for finding a stay, hosting a place, and making
              payments with SafeTrust.
            </p>
          </header>

          <div className="mt-12 space-y-12">
            {HELP_GROUPS.map((group) => (
              <section
                key={group.title}
                aria-labelledby={`group-${group.title}`}
              >
                <h2
                  id={`group-${group.title}`}
                  className="text-2xl font-semibold tracking-tight text-foreground"
                >
                  {group.title}
                </h2>
                {group.topics.length === 0 ? (
                  <p className="mt-4 text-muted-foreground">
                    More guides are coming soon.
                  </p>
                ) : (
                  <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.topics.map((topic) => (
                      <li key={topic.slug} className="h-full">
                        <Suspense
                          fallback={
                            <TopicLinkFallback
                              topic={topic}
                              className="block h-full rounded-2xl border border-border bg-card p-5 shadow-sm"
                            >
                              <TopicCardContent topic={topic} />
                            </TopicLinkFallback>
                          }
                        >
                          <HelpTopicLink
                            topic={topic}
                            className="block h-full rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                          >
                            <TopicCardContent topic={topic} />
                          </HelpTopicLink>
                        </Suspense>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </PageContainer>
      </main>
    </>
  );
}

function TopicCardContent({ topic }: { topic: HelpTopic }) {
  return (
    <>
      <h3 className="text-lg font-semibold text-foreground">{topic.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {topic.description}
      </p>
      <span className="mt-5 inline-flex items-center text-sm font-semibold text-primary">
        Read guide <span aria-hidden="true" className="ml-1">→</span>
      </span>
    </>
  );
}
