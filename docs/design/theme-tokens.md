# Theme tokens

SafeTrust uses neutral surfaces and orange brand details in both themes. Light
mode keeps orange restrained; dark mode uses orange for primary actions and
selected navigation. Guest routes use the same theme as the rest of the app.

## Token values

Values are the HSL components stored in `src/app/globals.css`. `/ alpha` means
the token includes its own alpha channel; do not add a Tailwind opacity modifier
to those colors (`bg-nav-active/50`, `bg-glass/50`, and similar produce invalid
CSS). `--accent` remains opaque because `CustomDateRangePicker` uses
`bg-accent/50`.

| Token                      | Light                           | Dark                            | Role                           |
| -------------------------- | ------------------------------- | ------------------------------- | ------------------------------ |
| `--background`             | `0 0% 100%`                     | `222.2 84% 4.9%`                | Page surface                   |
| `--foreground`             | `222.2 84% 4.9%`                | `210 40% 98%`                   | Default text                   |
| `--card`                   | `0 0% 100%`                     | `222.2 47% 8%`                  | Card surface                   |
| `--card-foreground`        | `222.2 84% 4.9%`                | `210 40% 98%`                   | Card text                      |
| `--popover`                | `0 0% 100%`                     | `222.2 47% 8%`                  | Popover surface                |
| `--popover-foreground`     | `222.2 84% 4.9%`                | `210 40% 98%`                   | Popover text                   |
| `--primary`                | `17.5 88.3% 40.4%` (orange-700) | `24.6 95% 53.1%` (orange-500)   | Brand color                    |
| `--primary-foreground`     | `0 0% 100%`                     | `229 84% 5%` (slate-950)        | Text/icon on primary           |
| `--secondary`              | `210 40% 96.1%`                 | `217.2 32.6% 17.5%`             | Secondary surface              |
| `--secondary-foreground`   | `222.2 47.4% 11.2%`             | `210 40% 98%`                   | Secondary text                 |
| `--muted`                  | `210 40% 96.1%`                 | `217.2 32.6% 17.5%`             | Muted surface                  |
| `--muted-foreground`       | `215.4 16.3% 36%`               | `215 20.2% 70%`                 | Muted text                     |
| `--accent`                 | `210 40% 96.1%`                 | `15 55% 12%`                    | Neutral hover/active surface   |
| `--accent-foreground`      | `222.2 47.4% 11.2%`             | `30.7 97.2% 72.4%` (orange-300) | Text on accent                 |
| `--ring`                   | `20.5 90.2% 48.2%` (orange-600) | `27 96% 61%` (orange-400)       | Keyboard focus                 |
| `--action`                 | `0 0% 100%`                     | `24.6 95% 53.1%` (orange-500)   | Default button fill            |
| `--action-foreground`      | `222.2 47.4% 11.2%`             | `229 84% 5%` (slate-950)        | Button text                    |
| `--action-border`          | `214.3 31.8% 85%`               | `24.6 95% 53.1%`                | Outlined button border         |
| `--action-hover`           | `210 40% 98%`                   | `27 96% 61%` (orange-400)       | Button hover                   |
| `--nav-active`             | `0 0% 100%`                     | `13 81% 15% / 0.3`              | Selected navigation surface    |
| `--nav-active-foreground`  | `222.2 47.4% 11.2%`             | `30.7 97.2% 72.4%` (orange-300) | Selected navigation text       |
| `--nav-active-icon`        | `17.5 88.3% 40.4%` (orange-700) | `24.6 95% 53.1%` (orange-500)   | Selected navigation icon       |
| `--nav-indicator`          | `20.5 90.2% 48.2%` (orange-600) | `24.6 95% 53.1%` (orange-500)   | Selected navigation bar        |
| `--glass`                  | `0 0% 100% / 0.72`              | `222 47% 8% / 0.9`              | Translucent card surface       |
| `--glass-border`           | `214.3 31.8% 91.4% / 0.9`       | `215 25% 27% / 0.6`             | Glass border                   |
| `--glass-shadow`           | `222 47% 11% / 0.06`            | `0 0% 0% / 0.25`                | Glass shadow color             |
| `--border` / `--input`     | `214.3 31.8% 91.4%`             | `217.2 32.6% 17.5%`             | Borders and input edges        |
| `--destructive`            | `0 84.2% 45%`                   | `0 62.8% 50.6%`                 | Destructive state; unchanged   |
| `--destructive-foreground` | `0 0% 100%`                     | `0 0% 100%`                     | Destructive text; unchanged    |
| `--success`                | `142.1 76.2% 36.3%`             | `142.1 70.6% 45.3%`             | Success state; unchanged       |
| `--success-foreground`     | `0 0% 100%`                     | `0 0% 100%`                     | Success text; unchanged        |
| `--chart-1`                | `24.6 95% 53.1%`                | `24.6 95% 53.1%`                | Chart series; unchanged        |
| `--chart-2`                | `221.2 83.2% 53.3%`             | `221.2 83.2% 53.3%`             | Chart series; unchanged        |
| `--chart-3`                | `142.1 76.2% 36.3%`             | `142.1 76.2% 36.3%`             | Chart series; unchanged        |
| `--chart-4`                | `47.9 95.8% 53.1%`              | `47.9 95.8% 53.1%`              | Chart series; unchanged        |
| `--chart-5`                | `0 84.2% 60.2%`                 | `0 84.2% 60.2%`                 | Chart series; unchanged        |
| `--radius`                 | `0.75rem`                       | `0.75rem`                       | Shared corner radius           |
| `--scrollbar-track`        | `210 40% 96.1%`                 | `222 40% 14%`                   | Scrollbar track                |
| `--scrollbar-thumb`        | `215 16% 47% / 0.45`            | `24.6 95% 53.1% / 0.45`         | Neutral/orange scrollbar thumb |
| `--scrollbar-thumb-hover`  | `20.5 90.2% 48.2%`              | `27 96% 61%`                    | Scrollbar hover                |

### Semantic colors

`--destructive`, `--destructive-foreground`, `--success`,
`--success-foreground`, `--chart-1` through `--chart-5`, and the Sonner theme
overrides (`--success-text`, `--error-text`, `--warning-text`, and
`--info-text`) remain semantic and are not brand colors. Their existing values
are unchanged. `--radius` is not a color token.

## State usage

| State    | Token/use                                                                                                                                           |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default  | `--foreground` on `--background`; `--action` and `--action-foreground` for the default button; `--primary` for brand details                        |
| Hover    | `--action-hover` for buttons; `--accent` with `--accent-foreground` for neutral navigation and control hover                                        |
| Pressed  | Keep the action fill and apply a subtle pressed treatment; do not introduce a new brand hue                                                         |
| Selected | `--nav-active`, `--nav-active-foreground`, `--nav-active-icon`, and the shaped `--nav-indicator`; profile offers may use the orange selected recipe |
| Disabled | Keep the control's current surface and reduce opacity; disabled state must not be communicated by color alone                                       |
| Focus    | `--ring` for a visible keyboard focus outline/ring; retain the component's focus shape and width                                                    |

## Contrast

Ratios below use the token colors composited over their listed rendered
backgrounds: white/off-white in light mode, and the near-black page or dark
card in dark mode. The semitransparent dark selected surface is composed over
the page before measuring its foreground. These are computed token estimates;
re-measure them on rendered pages in the PR, where gradients, glass, and
underlying content can affect the final result.

| Pair                                           | Rendered background                        |  Ratio | Target        |
| ---------------------------------------------- | ------------------------------------------ | -----: | ------------- |
| Dark orange-300 selected text on orange-950/30 | Page (`--background`) under `--nav-active` | 11.4:1 | ≥ 4.5:1 ✓     |
| Dark orange-300 text on `--accent` (`#2f160e`) | Dark card/surface                          | 10.0:1 | ≥ 4.5:1 ✓     |
| Dark orange-500 icon or ring on page           | Dark page (`--background`)                 |  7.1:1 | ≥ 3:1 ✓       |
| Dark slate-950 text on orange-500 button       | Orange-500 `--action`                      |  7.2:1 | ≥ 4.5:1 ✓     |
| Dark white text on orange-500                  | Orange-500 `--action`                      |  2.8:1 | ✗ Not allowed |
| Light orange-700 text on white                 | White page/card                            |  5.2:1 | ≥ 4.5:1 ✓     |
| Light orange-600 focus ring on white           | White page/card                            |  3.6:1 | ≥ 3:1 ✓       |
| Light slate-900 text on white button           | White `--action`                           | 17.9:1 | ≥ 4.5:1 ✓     |

## Do / don't

- Do use orange as a detail in light mode and as the brand accent in dark mode.
- Do keep page and card surfaces neutral: white/off-white in light mode and
  navy/near-black in dark mode.
- Do use the shaped navigation indicator alongside selected colors.
- Don't use orange as a page background.
- Don't use white text on orange-500; use slate-950 (`--action-foreground`).
- Don't indicate selection by color alone.
- Don't add Tailwind opacity modifiers to `--nav-active`, `--glass`, or
  `--glass-border`; their alpha is included in each token.
- Don't reintroduce blue brand hues through guest-specific theme overrides.
