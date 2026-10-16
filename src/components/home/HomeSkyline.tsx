import Image from "next/image";

/** Decorative city line art behind the hero. Hidden from assistive tech and pointer input. */
export function HomeSkyline() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 flex justify-center"
    >
      <Image
        src="/img/buildings.png"
        alt=""
        width={1366}
        height={768}
        priority
        sizes="(min-width: 1280px) 1152px, 100vw"
        className="h-auto w-full max-w-6xl select-none opacity-60 motion-safe:animate-skyline-in dark:opacity-25 dark:invert"
      />
    </div>
  );
}
