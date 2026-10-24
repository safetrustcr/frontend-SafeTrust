/**
 * Help centre content served at `/help` and `/help/[slug]`.
 *
 * The rent "Help & docs" panel links to these slugs, so every slug the panel
 * uses must exist here (covered by `articles.test.ts`). Content is static and
 * describes the flows available in this UI skeleton.
 */

export interface HelpSection {
  heading: string;
  paragraphs: readonly string[];
}

export interface HelpArticle {
  slug: string;
  title: string;
  summary: string;
  sections: readonly HelpSection[];
}

export const HELP_ARTICLES: readonly HelpArticle[] = [
  {
    slug: "using-rent-filters",
    title: "Finding a place",
    summary: "Search destinations and narrow results with filters and sort.",
    sections: [
      {
        heading: "Pick a destination",
        paragraphs: [
          "The destination carousel at the top of /rent shows how many units are available in each area. Select one to limit the results to that location, or select it again to see every destination.",
          "You can also search by name or address: the results only include places whose name or address matches your search.",
        ],
      },
      {
        heading: "Filter the results",
        paragraphs: [
          "Use the category chips and the bedroom tabs to narrow the list. On large screens the price filters live in the left sidebar; on smaller screens open them with the Filters button, which also shows how many filters are active.",
          "If nothing matches, use “Clear all filters” to start again.",
        ],
      },
      {
        heading: "Sort and location",
        paragraphs: [
          "Sort by relevance or price from the Sort menu. When you share your location with “Near me”, you can also sort by distance. If you stop sharing your location, results fall back to relevance.",
        ],
      },
    ],
  },
  {
    slug: "guest-guide",
    title: "Guest guide",
    summary: "Save places, message hosts and book a stay.",
    sections: [
      {
        heading: "Save places you like",
        paragraphs: [
          "Sign in to save listings to your favourites so you can compare them later from your dashboard.",
        ],
      },
      {
        heading: "Talk to the host",
        paragraphs: [
          "Open a listing to see its details, location and host. Use your dashboard messages to ask the host questions before you book.",
        ],
      },
      {
        heading: "Book",
        paragraphs: [
          "When you book, SafeTrust shows the full total before you pay. Payment goes into an escrow instead of straight to the host. See “How escrow payments work” for what happens next.",
        ],
      },
    ],
  },
  {
    slug: "escrow-explained",
    title: "How escrow payments work",
    summary: "Where your money is held and who releases it.",
    sections: [
      {
        heading: "Your payment is held in escrow",
        paragraphs: [
          "Bookings are paid through a Trustless Work escrow on the Stellar network. Your funds are held by the escrow contract, not by the host, until the agreed conditions are met.",
        ],
      },
      {
        heading: "Two steps: create, then fund",
        paragraphs: [
          "Checkout first creates the escrow for your booking and then funds it with the booking total. Each step asks your wallet for a signature. If a step is still being confirmed by the network, SafeTrust checks its status before letting you try again, so you are never charged twice.",
        ],
      },
      {
        heading: "Release and disputes",
        paragraphs: [
          "Funds are released to the host once the stay conditions are approved. If something goes wrong, a dispute resolver reviews the case before any funds move.",
        ],
      },
    ],
  },
  {
    slug: "host-guide",
    title: "Host guide",
    summary: "List a property and manage offers.",
    sections: [
      {
        heading: "Switch to host view",
        paragraphs: [
          "Use “Switch to host view” on /rent to open your dashboard, where you manage your properties.",
        ],
      },
      {
        heading: "List a property",
        paragraphs: [
          "Add an apartment with its photos, location, price and amenities from the apartments section of the dashboard. You can edit a listing at any time.",
        ],
      },
      {
        heading: "Manage bookings and payments",
        paragraphs: [
          "Follow booking escrows from the escrow dashboard and reply to guests from your messages. Payments are released from escrow, so you can see when a booking has been funded before the stay.",
        ],
      },
    ],
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    summary: "Location, wallet and payment issues.",
    sections: [
      {
        heading: "Location is not working",
        paragraphs: [
          "“Near me” needs location permission from your browser. If you blocked it, allow location for this site in your browser settings and try again. Results are sorted by relevance while no location is available.",
        ],
      },
      {
        heading: "Wallet problems",
        paragraphs: [
          "Make sure your Stellar wallet is unlocked and set to the same network SafeTrust shows in the Help & docs panel. Testnet uses test money only.",
        ],
      },
      {
        heading: "A payment seems stuck",
        paragraphs: [
          "After you sign, the network can take a moment to confirm. Stay on the checkout page while it shows the payment as submitted; it checks the status automatically and only offers another attempt once it knows the result.",
        ],
      },
    ],
  },
];

export function getHelpArticle(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((article) => article.slug === slug);
}

const DEFAULT_RETURN_PATH = "/rent";

/**
 * Resolves the `from` query parameter the help panel passes along into a safe
 * same-site "/rent" path. Anything else (absolute URLs, protocol-relative
 * URLs, other routes) falls back to "/rent" so the link cannot be used as an
 * open redirect.
 */
export function resolveReturnPath(from: string | string[] | undefined) {
  const value = Array.isArray(from) ? from[0] : from;
  if (!value) return DEFAULT_RETURN_PATH;
  if (value === "/rent" || value.startsWith("/rent?")) return value;
  return DEFAULT_RETURN_PATH;
}

/** Builds an internal help link that keeps the `from` return path. */
export function helpPath(path: string, returnPath: string) {
  return `${path}?from=${encodeURIComponent(returnPath)}`;
}
