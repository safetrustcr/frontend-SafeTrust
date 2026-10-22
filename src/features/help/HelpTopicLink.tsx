"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import type { HelpTopic } from "./manifest";
import { safeRentReturn } from "./return-target";

export function HelpTopicLink({
  topic,
  children,
  className,
}: {
  topic: Pick<HelpTopic, "slug">;
  children: ReactNode;
  className?: string;
}) {
  const searchParams = useSearchParams();
  const from = safeRentReturn(searchParams.get("from"));
  const href =
    from === "/rent"
      ? `/help/${topic.slug}`
      : { pathname: `/help/${topic.slug}`, query: { from } };

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
