"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import type { HelpTopic } from "./manifest";
import { safeRentReturn } from "./return-target";

/** A help link that carries the rental search to return to (?from=). */
function HelpLink({
  pathname,
  children,
  className,
}: {
  pathname: string;
  children: ReactNode;
  className?: string;
}) {
  const searchParams = useSearchParams();
  const from = safeRentReturn(searchParams.get("from"));
  const href = from === "/rent" ? pathname : { pathname, query: { from } };

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function HelpTopicLink({
  topic,
  ...props
}: {
  topic: Pick<HelpTopic, "slug">;
  children: ReactNode;
  className?: string;
}) {
  return <HelpLink pathname={`/help/${topic.slug}`} {...props} />;
}

export function HelpIndexLink(props: {
  children: ReactNode;
  className?: string;
}) {
  return <HelpLink pathname="/help" {...props} />;
}
