"use client";

import { Suspense } from "react";
import { SearchComposer } from "@/features/listings";

export const SearchHeader = () => (
  <Suspense
    fallback={
      <div className="h-11 w-full min-w-0 rounded-full border border-border bg-muted/60" />
    }
  >
    <SearchComposer />
  </Suspense>
);
