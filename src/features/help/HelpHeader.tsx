import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PageContainer } from "@/components/layouts/PageContainer";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { BrowseRentalsLink } from "./BrowseRentalsLink";

const BROWSE_RENTALS_CLASS_NAME =
  "rounded-full px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted";

export function HelpHeader({ returnPath }: { returnPath?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <PageContainer className="flex h-16 items-center justify-between gap-4">
        <Link href="/help" className="flex min-w-0 items-center gap-2">
          <Image
            src="/img/logo.png"
            alt=""
            width={40}
            height={40}
            priority
            className="h-9 w-9 shrink-0 object-contain"
          />
          <span className="truncate text-lg font-semibold text-foreground">
            SafeTrust Help
          </span>
        </Link>
        <nav aria-label="Help navigation" className="flex items-center gap-3">
          {returnPath ? (
            <Link href={returnPath} className={BROWSE_RENTALS_CLASS_NAME}>
              Browse rentals
            </Link>
          ) : (
            <Suspense
              fallback={
                <Link href="/rent" className={BROWSE_RENTALS_CLASS_NAME}>
                  Browse rentals
                </Link>
              }
            >
              <BrowseRentalsLink className={BROWSE_RENTALS_CLASS_NAME} />
            </Suspense>
          )}
          <ThemeToggle />
        </nav>
      </PageContainer>
    </header>
  );
}
