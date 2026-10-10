"use client";

import { createContext, useCallback, useContext, useState } from "react";
import {
  LazyMotion,
  useReducedMotion,
  type LazyFeatureBundle,
  type FeatureBundle,
} from "motion/react";

const MotionEnabled = createContext(false);
export const useMotionEnabled = () => useContext(MotionEnabled);

export function LazyMotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const reducedMotion = useReducedMotion();
  const loadFeatures: LazyFeatureBundle = useCallback(async () => {
    try {
      const features = await import("./motion-features");
      setReady(true);
      return features.default;
    } catch {
      // Leave the optional renderer unloaded and keep the page static and usable.
      return new Promise<FeatureBundle>(() => {});
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
