# Theme tokens

SafeTrust themes are driven by CSS custom properties in `src/app/globals.css`
and mapped to Tailwind utilities in `tailwind.config.ts`. `next-themes` adds
`.dark` to the `<html>` element; a custom `light:` variant
(`:root:not(.dark) &`) targets every other theme.

Motion is intentionally small and purposeful. It reuses the existing lazy
motion infrastructure (`LazyMotionProvider` / `useMotionEnabled`,
`DashboardReveal`, `motion/react-m`) and never adds an animation dependency.

## Motion inventory

| Surface             | Effect                       | Duration | Themes | Reduced motion |
| ------------------- | ---------------------------- | -------- | ------ | -------------- |
| Button default/outline | lift 1px + shadow         | 150 ms   | light  | colour only    |
| Nav item            | colour + indicator scale      | 150–200 ms | both | colour only    |
| Glass panel entry   | fade + 6px                    | 220 ms   | both   | none           |

## Motion rules

- Only `transform`, `opacity`, and colour/shadow properties animate; size,
  padding, and border width never change, so layout stays put.
- Light-mode lift and press motion is gated by `motion-safe:` and the `light:`
  variant, so dark mode keeps quiet colour transitions only.
- Reduced motion removes all transforms. Loading and pending states still
  communicate progress through text (for example, "Saving…") and spinners.
- Panel entry runs once per route. Changing the theme does not remount the
  page, reset forms, or replay the entry.
