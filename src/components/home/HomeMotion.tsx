"use client";

import { useRef } from "react";
import { useInView, type HTMLMotionProps, type Variants } from "motion/react";
import * as m from "motion/react-m";
import {
  LazyMotionProvider,
  useMotionEnabled,
} from "@/components/ui/LazyMotionProvider";

export const HomeMotion = LazyMotionProvider;
const reveal: Variants = {
  enter: {
    opacity: [0.75, 1],
    y: [16, 0],
    transition: { duration: 0.45, ease: "easeOut" },
  },
  still: { opacity: 1, y: 0, transition: { duration: 0 } },
};

export function HomeMotionSection({
  revealOnScroll = true,
  ...props
}: HTMLMotionProps<"section"> & { revealOnScroll?: boolean }) {
  const enabled = useMotionEnabled();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <m.section
      {...props}
      ref={ref}
      initial={false}
      animate={enabled && (!revealOnScroll || inView) ? "enter" : "still"}
      variants={{ enter: { transition: { staggerChildren: 0.09 } } }}
    />
  );
}

export function HomeMotionItem(props: HTMLMotionProps<"div">) {
  return <m.div {...props} initial={false} variants={reveal} />;
}

export function HomeMotionStep(props: HTMLMotionProps<"li">) {
  const enabled = useMotionEnabled();
  return (
    <m.li
      {...props}
      initial={false}
      variants={reveal}
      whileHover={
        enabled ? { y: -4, transition: { duration: 0.2 } } : undefined
      }
    />
  );
}
