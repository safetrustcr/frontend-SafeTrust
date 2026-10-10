"use client";

import { type HTMLMotionProps } from "motion/react";
import * as m from "motion/react-m";
import {
  LazyMotionProvider,
  useMotionEnabled,
} from "@/components/ui/LazyMotionProvider";

export const AuthMotion = LazyMotionProvider;

export function AuthMotionPanel(props: HTMLMotionProps<"div">) {
  const enabled = useMotionEnabled();
  return (
    <m.div
      {...props}
      initial={false}
      animate={enabled ? "enter" : "still"}
      variants={{ enter: { transition: { staggerChildren: 0.06 } } }}
    />
  );
}

export function AuthMotionItem(props: HTMLMotionProps<"div">) {
  return (
    <m.div
      {...props}
      initial={false}
      variants={{
        enter: {
          y: [12, 0],
          transition: { duration: 0.35, ease: "easeOut" },
        },
        still: { opacity: 1, y: 0, transition: { duration: 0 } },
      }}
    />
  );
}

export function AuthMotionButton(props: HTMLMotionProps<"button">) {
  const enabled = useMotionEnabled();
  return (
    <m.button
      {...props}
      whileHover={enabled && !props.disabled ? { y: -2 } : undefined}
      whileTap={enabled && !props.disabled ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.15 }}
    />
  );
}

export function AuthMotionError({ children }: { children: React.ReactNode }) {
  const enabled = useMotionEnabled();
  return (
    <m.p
      role="alert"
      className="text-center text-sm text-destructive"
      initial={false}
      animate={enabled ? { y: [4, 0] } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </m.p>
  );
}
