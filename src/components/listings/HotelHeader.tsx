"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  Bell,
  ChevronDown,
  CircleUserRound,
  Grid2X2,
  Heart,
  Lightbulb,
  Search,
} from "lucide-react";

interface HotelHeaderProps {
  showHostSwitch?: boolean;
}

const RENT_ITEMS = [
  {
    icon: Grid2X2,
    label: "Browse all units",
    description: "Filter by price, location, rooms",
    href: "/rent",
  },
  {
    icon: Lightbulb,
    label: "Suggestions",
    description: "Curated picks with detail view",
    href: "/guest/suggestions",
  },
  {
    icon: Heart,
    label: "My Wishlist",
    description: "Your saved apartments",
    href: "/dashboard/favorites",
  },
] as const;

/** Render the shared rent destination menu. */
export function RentDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    /** Close the menu when a click lands outside it. */
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    /** Close the menu and restore focus when Escape is pressed. */
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="rent-navigation-menu"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        Rent
        <ChevronDown
          aria-hidden="true"
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          id="rent-navigation-menu"
          role="menu"
          aria-label="Rent navigation"
          className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-background py-1 shadow-lg"
        >
          {RENT_ITEMS.map(({ icon: Icon, label, description, href }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
            >
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Icon aria-hidden="true" className="h-4 w-4 text-orange-500" />
              </span>
              <span>
                <span className="block text-sm font-medium text-gray-900 dark:text-white">
                  {label}
                </span>
                <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                  {description}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HotelHeader({
  showHostSwitch = false,
}: HotelHeaderProps) {
  return <HotelHeaderContent showHostSwitch={showHostSwitch} />;
}

function HotelHeaderContent({ showHostSwitch }: HotelHeaderProps) {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-[1180px] items-center gap-4 px-5 py-5 lg:px-7">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/img/logo.png" alt="SafeTrust" width={36} height={36} />
          <span className="text-2xl font-semibold text-foreground">
            SafeTrust
          </span>
        </Link>

        <div className="order-3 mx-0 flex w-full items-center rounded-full border border-border bg-muted/60 px-2 py-1.5 sm:order-none sm:mx-auto sm:max-w-md">
          <RentDropdown />
          <div className="mx-3 h-6 w-px bg-gray-300 dark:bg-slate-600" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            City, province or neighborhood
          </span>
          <Search
            aria-hidden="true"
            data-testid="header-search-icon"
            className="ml-auto h-4 w-4 text-gray-600 dark:text-gray-300"
          />
        </div>

        <div className="ml-auto flex items-center gap-3 sm:gap-5">
          {showHostSwitch && (
            <Link
              href="/dashboard/escrow-dashboard"
              className="hidden text-sm font-semibold text-orange-700 transition-colors hover:text-orange-800 sm:block whitespace-nowrap"
            >
              Switch to Host view
            </Link>
          )}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          <div className="relative">
            <Bell
              aria-hidden="true"
              data-testid="header-notification-icon"
              className="h-4 w-4 text-gray-900 dark:text-white"
            />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-orange-500" />
          </div>
          <span className="hidden text-sm font-semibold text-foreground lg:block">
            Randall Valenciano
          </span>
          <div className="grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-gray-100 dark:border-slate-700 dark:bg-slate-800">
            <CircleUserRound
              aria-hidden="true"
              data-testid="header-user-icon"
              className="h-5 w-5 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
