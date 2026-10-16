"use client";

import { useRef } from "react";
import { useInView, type HTMLMotionProps } from "motion/react";
import * as m from "motion/react-m";
import { useMotionEnabled } from "@/components/ui/LazyMotionProvider";

/** Reveal once in view; content is visible before the optional features load. */
export function RentReveal({
  delay = 0,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number }) {
  const enabled = useMotionEnabled();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <m.div
      {...props}
      ref={ref}
      initial={false}
      animate={enabled && inView ? "enter" : "still"}
      variants={{
        enter: {
          opacity: [0.75, 1],
          y: [12, 0],
          transition: { duration: 0.35, delay, ease: "easeOut" },
        },
        still: { opacity: 1, y: 0, transition: { duration: 0 } },
      }}
    />
  );
}
