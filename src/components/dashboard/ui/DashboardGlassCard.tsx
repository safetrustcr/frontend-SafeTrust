"use client";

import { forwardRef, type HTMLAttributes } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/useInView";
import { DashboardReveal } from "./DashboardReveal";

const GlassSurface = dynamic(
  () => import("./GlassSurface").catch(() => ({ default: () => null })),
  { ssr: false },
);

export const DashboardGlassCard = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { revealDelay?: number }
>(({ children, className, revealDelay = 0, ...props }, forwardedRef) => {
  const { ref, isInView } = useInView<HTMLDivElement>();
  return (
    <DashboardReveal delay={revealDelay} className="flex min-w-0 flex-col">
      <div
        {...props}
        ref={(element) => {
          ref.current = element;
          if (typeof forwardedRef === "function") forwardedRef(element);
          else if (forwardedRef) forwardedRef.current = element;
        }}
        className={cn("dashboard-glass-card", className)}
      >
        <div aria-hidden="true" className="dashboard-glass-decoration">
          {isInView && <GlassSurface />}
        </div>
        <div className="dashboard-glass-content">{children}</div>
      </div>
    </DashboardReveal>
  );
});
DashboardGlassCard.displayName = "DashboardGlassCard";
