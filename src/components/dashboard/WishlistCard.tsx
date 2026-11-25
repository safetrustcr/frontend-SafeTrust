import Link from "next/link";

export interface WishlistCardProps {
  name: string;
  images: string[];
  subtitle: string;
  href: string;
  priority?: boolean;
}

export function WishlistCard({
  name,
  images,
  subtitle,
  href,
  priority = false,
}: WishlistCardProps) {
  const slots = [...images.filter(Boolean).slice(0, 4)];

  // Pad to 4 slots with placeholder gray
  while (slots.length < 4) slots.push("");

  return (
    <Link
      href={href}
      className="group block rounded-2xl overflow-hidden transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* 2x2 image mosaic */}
      <div className="grid grid-cols-2 gap-0.5 aspect-square rounded-2xl overflow-hidden">
        {slots.map((src, i) => (
          <div key={i} className="bg-muted overflow-hidden">
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt=""
                loading={priority && i === 0 ? "eager" : "lazy"}
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="pt-3 space-y-0.5">
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </Link>
  );
}
