"use client";

import dynamic from "next/dynamic";

const SearchComposer = dynamic(
  () =>
    import("../search/SearchComposer").then((module) => module.SearchComposer),
  {
    ssr: false,
    loading: () => (
      <div className="h-11 w-full min-w-0 rounded-full border border-border bg-muted/60" />
    ),
  },
);

export const SearchHeader = () => <SearchComposer />;
