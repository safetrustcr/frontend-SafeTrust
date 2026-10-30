export type HelpAudience = "guest" | "host" | "everyone";

export interface HelpTopic {
  /** URL: /help/<slug>. Lowercase kebab-case only. */
  slug: string;
  /** A file name directly inside docs/help/. Never a path. */
  file: `${string}.md`;
  title: string;
  /** Used in the index and in <meta name="description">. */
  description: string;
  audience: HelpAudience;
  /** Other slugs in HELP_TOPICS. */
  related: readonly string[];
  /** ISO date of the last check against the UI. */
  verifiedAt: string;
  /** Short SHA of the commit the article was checked against. */
  verifiedCommit: string;
}

const VERIFIED_COMMIT = "ad2f38d7";
const VERIFIED_AT = "2026-10-22";

/**
 * The allowlist. The app may render only the files listed here as public Help.
 * Nothing else in docs/ is ever exposed.
 */
export const HELP_TOPICS = [
  {
    slug: "getting-started",
    file: "getting-started.md",
    title: "Getting started with SafeTrust",
    description: "What SafeTrust is, what you can do without an account, and where to go next.",
    audience: "everyone",
    related: ["using-rent-filters", "troubleshooting"],
    verifiedAt: VERIFIED_AT,
    verifiedCommit: VERIFIED_COMMIT,
  },
  {
    slug: "using-rent-filters",
    file: "using-rent-filters.md",
    title: "Finding a place on Rent",
    description: "How to search, filter and sort listings on the Rent page.",
    audience: "guest",
    related: ["getting-started", "troubleshooting"],
    verifiedAt: VERIFIED_AT,
    verifiedCommit: VERIFIED_COMMIT,
  },
  {
    slug: "guest-guide",
    file: "guest-guide.md",
    title: "Guest guide",
    description: "How to browse listings, book a stay, and pay safely as a guest.",
    audience: "guest",
    related: ["getting-started", "using-rent-filters", "troubleshooting"],
    verifiedAt: VERIFIED_AT,
    verifiedCommit: VERIFIED_COMMIT,
  },
  {
    slug: "host-guide",
    file: "host-guide.md",
    title: "Host guide",
    description: "How to list a place, manage bookings, and understand payouts as a host.",
    audience: "host",
    related: ["getting-started", "troubleshooting"],
    verifiedAt: VERIFIED_AT,
    verifiedCommit: VERIFIED_COMMIT,
  },
  {
    slug: "escrow-explained",
    file: "escrow-explained.md",
    title: "How escrow payments work",
    description: "How SafeTrust holds funds, releases them, and protects both guests and hosts.",
    audience: "everyone",
    related: ["getting-started", "troubleshooting"],
    verifiedAt: VERIFIED_AT,
    verifiedCommit: VERIFIED_COMMIT,
  },
  {
    slug: "troubleshooting",
    file: "troubleshooting.md",
    title: "Troubleshooting",
    description: "Fixes for location, wallet and payment problems, and how to reach support.",
    audience: "everyone",
    related: ["getting-started"],
    verifiedAt: VERIFIED_AT,
    verifiedCommit: VERIFIED_COMMIT,
  },
] as const satisfies readonly HelpTopic[];
