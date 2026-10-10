"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { LazyMotion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import * as m from "motion/react-m";

const MotionEnabled = createContext(false);

export function AuthMotion({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const reducedMotion = useReducedMotion();
  const loadFeatures = useCallback(async () => {
    try {
      const features = await import("./motion-features");
      setReady(true);
      return features.default;
    } catch {
      // Authentication remains usable if the optional animation chunk fails.
      return {};
    }
  }, []);

  return (
    <MotionEnabled.Provider value={ready && reducedMotion === false}>
      <LazyMotion features={loadFeatures} strict>
        {children}
      </LazyMotion>
    </MotionEnabled.Provider>
  );
}

export function AuthMotionPanel(props: HTMLMotionProps<"div">) {
  const enabled = useContext(MotionEnabled);
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
          opacity: [0.75, 1],
          y: [12, 0],
          transition: { duration: 0.35, ease: "easeOut" },
        },
        still: { opacity: 1, y: 0, transition: { duration: 0 } },
      }}
    />
  );
}

export function AuthMotionButton(props: HTMLMotionProps<"button">) {
  const enabled = useContext(MotionEnabled);
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
  const enabled = useContext(MotionEnabled);
  return (
    <m.p
      role="alert"
      className="text-center text-sm text-destructive"
      initial={false}
      animate={enabled ? { opacity: [0.5, 1], y: [4, 0] } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </m.p>
  );
}
