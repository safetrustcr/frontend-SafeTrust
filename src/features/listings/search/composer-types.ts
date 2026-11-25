import type { ReactNode } from "react";
import type { Location } from "../model/filters";
import type { Listing } from "../model/types";
import type { StaySearch } from "./stay-search";

export interface SearchDraft extends StaySearch {
  location: Location | null;
  /** Two or more provinces chosen in the filters; any Where choice replaces them. */
  locations: Location[];
  nearby: boolean;
}

export type SectionId = "where" | "when" | "who";

export interface ComposerSection {
  id: SectionId;
  title: string;
  summary: (draft: SearchDraft) => string;
  render: (props: {
    draft: SearchDraft;
    setDraft: (patch: Partial<SearchDraft>) => void;
    today: string;
    /** Listings matching every criterion except Where (for Where counts). */
    listings: Listing[];
  }) => ReactNode;
}
