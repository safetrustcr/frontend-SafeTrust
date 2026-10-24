import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageContainer } from "@/components/layouts/PageContainer";
import {
  HELP_ARTICLES,
  helpPath,
  resolveReturnPath,
} from "@/features/help/articles";

export const metadata: Metadata = {
  title: "Help & docs | SafeTrust",
  description: "Guides for finding, booking, paying and hosting on SafeTrust.",
};

export default async function HelpIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const returnPath = resolveReturnPath((await searchParams).from);

  return (
    <PageContainer width="narrow" className="py-10 sm:py-14">
      <main>
        <Link
          href={returnPath}
          className="inline-flex items-center gap-2 text-sm font-medium text-orange-700 hover:underline dark:text-orange-400"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to rentals
        </Link>

        <h1 className="mt-6 text-3xl font-semibold text-foreground">
          Help &amp; docs
        </h1>
        <p className="mt-2 text-muted-foreground">
          Guides for finding, booking, paying and hosting on SafeTrust.
        </p>

        <ul className="mt-8 list-none space-y-3 p-0">
          {HELP_ARTICLES.map((article) => (
            <li key={article.slug}>
              <Link
                href={helpPath(`/help/${article.slug}`, returnPath)}
                className="block rounded-xl border border-border p-4 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 motion-reduce:transition-none"
              >
                <span className="block font-medium text-foreground">
                  {article.title}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {article.summary}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </PageContainer>
  );
}
