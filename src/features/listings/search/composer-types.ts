import type { ReactNode } from "react";
import type { Location } from "@/components/listings/filters/useRentFilters";
import type { StaySearch } from "./stay-search";

export interface SearchDraft extends StaySearch {
  location: Location | null;
  nearby: boolean;
}

export type ComposerSection = {
  id: "where" | "when" | "who";
  title: string;
  summary: (draft: SearchDraft) => string;
  render: (props: {
    draft: SearchDraft;
    setDraft: (patch: Partial<SearchDraft>) => void;
    today: string;
  }) => ReactNode;
};
