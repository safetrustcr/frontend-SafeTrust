import Image from "next/image";

interface Supporter {
  name: string; // spoken name
  caption?: string; // visible text next to a mark-only logo
  href: string; // official site; confirm with maintainers
  src: string;
  width: number;
  height: number;
  // Visible alpha bounds in the supplied PNG, leaving the original file intact.
  crop: { x: number; y: number; width: number; height: number };
  className: string;
  darkClassName?: string;
}

const SUPPORTERS: Supporter[] = [
  {
    name: "Stellar",
    caption: "Stellar",
    href: "https://stellar.org",
    src: "/img/brands/stellar-mark.png",
    width: 613,
    height: 407,
    crop: { x: 133, y: 42, width: 413, height: 351 },
    className: "w-9 sm:w-10",
    darkClassName: "dark:brightness-0 dark:invert",
  },
  {
    name: "Trustless Work",
    href: "https://www.trustlesswork.com",
    src: "/img/brands/trustless-work.png",
    width: 272,
    height: 50,
    crop: { x: 32, y: 8, width: 216, height: 32 },
    className: "w-[189px] sm:w-[216px]",
    darkClassName: "dark:brightness-0 dark:invert",
  },
  {
    name: "Drips",
    href: "https://www.drips.network",
    src: "/img/brands/drips-wave.png",
    width: 156,
    height: 55,
    crop: { x: 0, y: 0, width: 156, height: 55 },
    className: "w-32 sm:w-36",
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
                className="flex min-h-11 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                <span
                  aria-hidden="true"
                  className={`relative block shrink-0 overflow-hidden ${s.className}`}
                  style={{ aspectRatio: `${s.crop.width} / ${s.crop.height}` }}
                >
                  <Image
                    src={s.src}
                    alt="" /* the link's aria-label names it once */
                    width={s.width}
                    height={s.height}
                    sizes="(min-width: 640px) 272px, 240px"
                    className={`absolute h-auto max-w-none ${s.darkClassName ?? ""}`}
                    style={{
                      width: `${(s.width / s.crop.width) * 100}%`,
                      left: `${(-s.crop.x / s.crop.width) * 100}%`,
                      top: `${(-s.crop.y / s.crop.height) * 100}%`,
                    }}
                  />
                </span>
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
