import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Illustration({ className }: { className?: string }) {
  return (
    <div className={cn("relative aspect-[5/4] w-full", className)}>
      <Image
        src="/img/hotels.png"
        alt=""
        fill
        sizes="(min-width: 1280px) 544px, 50vw"
        className="object-contain dark:opacity-20 motion-safe:transition-opacity motion-safe:duration-300"
        priority
      />
    </div>
  );
}
