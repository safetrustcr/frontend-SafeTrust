"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BookOpen,
  House,
  LifeBuoy,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { clientEnv } from "@/config/env";
import { helpPath } from "./articles";

/**
 * Short pointers to the guides served under `/help` (see `./articles`). The panel
 * links out instead of duplicating article content, and carries the current
 * "/rent" search through the `from` parameter so readers land back on the
 * same results.
 */
const HELP_LINKS = [
  {
    title: "Finding a place",
    description: "Destinations, filters, sort and location.",
    slug: "using-rent-filters",
    icon: MapPin,
  },
  {
    title: "Guest guide",
    description: "Save, message hosts, book.",
    slug: "guest-guide",
    icon: UserRound,
  },
  {
    title: "How escrow payments work",
    description: "Where your money is held and who releases it.",
    slug: "escrow-explained",
    icon: ShieldCheck,
  },
  {
    title: "Host guide",
    description: "List a property and manage offers.",
    slug: "host-guide",
    icon: House,
  },
  {
    title: "Troubleshooting",
    description: "Location, wallet and payment issues.",
    slug: "troubleshooting",
    icon: LifeBuoy,
  },
] as const;

interface RentHelpPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Returns the launcher (desktop tab or mobile toolbar button) that must
   * regain focus when the panel closes. Required because the launchers are
   * rendered by the page, so Radix cannot restore focus on its own.
   */
  restoreFocusTo?: () => HTMLElement | null;
}

/**
 * Right-side "Help & docs" sheet for the rent search. Launchers (a desktop
 * edge tab and a mobile toolbar button) live in the page; this component only
 * renders the panel so it can be reused on other search pages later.
 */
export function RentHelpPanel({
  open,
  onOpenChange,
  restoreFocusTo,
}: RentHelpPanelProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const network = clientEnv.NEXT_PUBLIC_TRUSTLESS_NETWORK;

  // Snapshot of the current rent search, passed to /help so the article's
  // "Back to rentals" link can restore the same query parameters.
  const fromParam = useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : (pathname ?? "/rent");
  }, [pathname, searchParams]);

  const helpHref = (path: string) => helpPath(path, fromParam);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        aria-describedby={undefined}
        onCloseAutoFocus={(event) => {
          const launcher = restoreFocusTo?.();
          if (launcher) {
            event.preventDefault();
            launcher.focus();
          }
        }}
      >
        <SheetTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <BookOpen
            aria-hidden="true"
            className="h-5 w-5 shrink-0 text-orange-700 dark:text-orange-400"
          />
          Help &amp; docs
        </SheetTitle>
        <SheetDescription className="mt-2 text-sm text-muted-foreground">
          Quick guides for finding, booking, paying and hosting on SafeTrust.
        </SheetDescription>

        <nav aria-label="Help topics" className="mt-5">
          <ul className="m-0 list-none space-y-1 p-0">
            {HELP_LINKS.map(({ title, description, slug, icon: Icon }) => (
              <li key={slug}>
                <Link
                  href={helpHref(`/help/${slug}`)}
                  className="flex items-start gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-border hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
                >
                  <Icon
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-orange-700 dark:text-orange-400"
                  />
                  <span>
                    <span className="block text-sm font-medium text-foreground">
                      {title}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {description}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mt-5 rounded-xl border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
          Stellar network:{" "}
          <span className="font-semibold text-foreground">{network}</span>
          {network === "testnet" ? (
            <> — testnet uses test money only, no real funds move.</>
          ) : null}
        </p>

        <div className="mt-auto border-t border-border pt-4">
          <Link
            href={helpHref("/help")}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
          >
            Open full documentation
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
