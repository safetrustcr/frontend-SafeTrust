import Image from "next/image";

interface Supporter {
  name: string; // spoken name
  caption?: string; // visible text next to a mark-only logo
  href: string; // official site; confirm with maintainers
  light: string; // logo for light backgrounds
  dark: string; // logo for dark backgrounds
  width: number; // intrinsic ratio from the SVG viewBox
  height: number;
}

const SUPPORTERS: Supporter[] = [
  {
    name: "Stellar",
    caption: "Stellar",
    href: "https://stellar.org",
    light: "/img/brands/stellar-mark-black.svg",
    dark: "/img/brands/stellar-mark-white.svg",
    width: 24,
    height: 24,
  },
  {
    name: "Trustless Work",
    href: "https://www.trustlesswork.com",
    light: "/img/brands/trustless-work-light.svg",
    dark: "/img/brands/trustless-work-dark.svg",
    width: 168,
    height: 32,
  },
  {
    name: "Drips",
    href: "https://www.drips.network",
    light: "/img/brands/drips-light.svg",
    dark: "/img/brands/drips-dark.svg",
    width: 160,
    height: 48,
  },
];

export function SupportedBy() {
  return (
    <section aria-labelledby="supported-by-heading" className="px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10">
        <h2
          id="supported-by-heading"
          className="text-base font-medium text-muted-foreground sm:text-lg"
        >
          Supported by
        </h2>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {SUPPORTERS.map((s) => (
            <li key={s.name}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${s.name} (opens in a new tab)`}
                className="flex min-h-11 items-center gap-2 rounded-md opacity-90 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {[
                  { src: s.light, cls: "dark:hidden" },
                  { src: s.dark, cls: "hidden dark:block" },
                ].map((v) => (
                  <Image
                    key={v.src}
                    src={v.src}
                    alt="" /* the link's aria-label names it once */
                    width={s.width}
                    height={s.height}
                    className={`h-7 w-auto sm:h-8 ${v.cls}`}
                  />
                ))}
                {s.caption && (
                  <span
                    aria-hidden="true"
                    className="text-2xl font-semibold text-foreground"
                  >
                    {s.caption}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
