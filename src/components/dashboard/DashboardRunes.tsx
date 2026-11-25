import { Noto_Sans_Runic } from "next/font/google";

// Inter has no runic glyphs; ship the runic subset so they never fall back to boxes.
const runic = Noto_Sans_Runic({
  weight: "400",
  subsets: ["runic"],
  display: "swap",
});

/** An easter egg: "Bi Soto Herrera" in runes, at the foot of the dashboard. */
export function DashboardRunes() {
  return (
    // Decorative: a screen reader would only spell out each rune's name.
    <div aria-hidden="true" className="mt-10 flex justify-center pb-2">
      <p
        className={`${runic.className} select-none text-sm tracking-[0.3em] text-muted-foreground`}
      >
        ᛒᛁ ᛋᚬᛏᚬ ᚺᛖᚱᚱᛖᚱᚨ
      </p>
    </div>
  );
}
