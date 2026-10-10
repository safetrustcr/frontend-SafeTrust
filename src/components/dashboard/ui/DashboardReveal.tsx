"use client";

import * as m from "motion/react-m";
import type { HTMLMotionProps } from "motion/react";
import { useInView } from "@/hooks/useInView";
import { useMotionEnabled } from "@/components/ui/LazyMotionProvider";

export function DashboardReveal({
  delay = 0,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number }) {
  const { ref, isInView } = useInView<HTMLDivElement>();
  const enabled = useMotionEnabled();
  return (
    <m.div
      {...props}
      ref={ref}
      initial={false}
      animate={enabled && isInView ? "enter" : "still"}
      variants={{
        enter: {
          y: [12, 0],
          transition: { duration: 0.35, delay, ease: "easeOut" },
        },
        still: { opacity: 1, y: 0, transition: { duration: 0 } },
      }}
    />
  );
}
