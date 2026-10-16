import type { ComponentType } from "react";
import { WhenSection, type WhenSectionProps } from "./WhenSection";

export interface SearchSectionRegistration {
  id: "where" | "when" | "who";
  label: string;
  component: ComponentType<WhenSectionProps>;
}

export const SEARCH_SECTIONS: Record<string, SearchSectionRegistration> = {
  when: {
    id: "when",
    label: "When",
    component: WhenSection,
  },
};
