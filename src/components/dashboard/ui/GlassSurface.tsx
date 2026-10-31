"use client";

import { useId } from "react";
import { useTheme } from "next-themes";
import { GlassCard } from "react-glass-ui";

/**
 * Decorative only: actual controls stay outside the package's content layer.
 * Values match CSS custom properties in src/app/globals.css:
 * - Light: --glass (0 0% 100% / 0.72) -> #ffffff with backgroundOpacity 0.2, borderOpacity 0.6
 * - Dark:  --glass (215 32% 12% / 0.9) -> #151c28 (hsl(215 32% 12%)) with backgroundOpacity 0.18
 * react-glass-ui uses WebGL/canvas shaders expecting literal color strings (hex/rgb),
 * so token values are represented directly to match globals.css.
 */
const TOKEN_LIGHT_BG = "#ffffff";
const TOKEN_DARK_BG = "#151c28"; // hsl(215 32% 12%) matching --glass in globals.css
const TOKEN_BORDER = "#ffffff";

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
      borderColor={TOKEN_BORDER}
      borderOpacity={dark ? 0.12 : 0.6}
      backgroundColor={dark ? TOKEN_DARK_BG : TOKEN_LIGHT_BG}
      backgroundOpacity={dark ? 0.18 : 0.2}
      innerLightColor={TOKEN_BORDER}
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
