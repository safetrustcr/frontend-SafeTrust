"use client";

import { useId } from "react";
import { useTheme } from "next-themes";
import { GlassCard } from "react-glass-ui";

/** Decorative only: actual controls stay outside the package's content layer. */
export default function GlassSurface() {
  const id = useId().replace(/:/g, "");
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  return (
    <GlassCard
      id={`dashboard-glass-${id}`}
      className="dashboard-glass-effect"
      padding="0"
      blur={4}
      distortion={0}
      flexibility={0}
      onHoverScale={1}
      chromaticAberration={0}
      borderRadius={20}
      borderSize={1}
      borderColor="#ffffff"
      borderOpacity={dark ? 0.12 : 0.55}
      backgroundColor={dark ? "#182033" : "#ffffff"}
      backgroundOpacity={dark ? 0.18 : 0.2}
      innerLightColor="#ffffff"
      innerLightOpacity={dark ? 0.04 : 0.12}
      innerLightBlur={10}
      outerLightOpacity={0}
      color="inherit"
      saturation={110}
      brightness={100}
    >
      <span />
    </GlassCard>
  );
}
