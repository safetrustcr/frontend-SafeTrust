import Image from "next/image";
import Link from "next/link";

const LEFT = [
  { href: "/", label: "Home" },
  { href: "/rent", label: "Browse stays" },
  { href: "/guest/suggestions", label: "Suggestions" },
];
const RIGHT = [
  {
    href: "/login?redirect=/dashboard/apartments/new",
    label: "List your property",
  },
  { href: "https://github.com/safetrustcr", label: "GitHub", external: true },
];

function FooterLinks({
  items,
}: {
  items: Array<{ href: string; label: string; external?: boolean }>;
}) {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            {...(item.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="inline-flex min-h-11 items-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function HomeFooter() {
  return (
    <footer className="border-t border-border bg-background/80">
      <nav
        aria-label="Footer"
        className="mx-auto grid max-w-5xl gap-4 px-4 py-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center"
      >
        <div className="order-2 sm:order-1 sm:justify-self-start">
          <FooterLinks items={LEFT} />
        </div>
        <Link
          href="/"
          className="order-1 flex items-center justify-center gap-2 justify-self-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:order-2"
        >
          <Image
            src="/img/logo.png"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7"
          />
          <span className="text-lg font-semibold text-foreground">
            SafeTrust
          </span>
        </Link>
        <div className="order-3 sm:justify-self-end">
          <FooterLinks items={RIGHT} />
        </div>
      </nav>
    </footer>
  );
}
