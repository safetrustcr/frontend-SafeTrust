import Image from "next/image";
import Link from "next/link";
import { PageContainer } from "@/components/layouts/PageContainer";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function HelpHeader() {
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
          <Link
            href="/rent"
            className="rounded-full px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Browse rentals
          </Link>
          <ThemeToggle />
        </nav>
      </PageContainer>
    </header>
  );
}
