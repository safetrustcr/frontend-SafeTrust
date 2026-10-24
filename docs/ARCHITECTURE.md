# SafeTrust Architecture Contract

This document defines the architectural layers, boundaries, and import contracts for `frontend-SafeTrust`. ESLint enforces these boundaries via `eslint.config.mjs` to keep the codebase maintainable, secure, and predictable.

Each section is labelled **Current**, **Demo**, or **Planned**. Planned items are targets, not rules the build enforces yet.

---

## Test and Mock Conventions (Current)

- Keep unit and integration tests co-located with their subjects as `*.test.ts` or `*.test.tsx` files under `src/`. Do not add `__tests__` directories.
- Keep demo data and fixtures with their features. Keep shared test helpers in `src/test/`.
- The test runner is Jest (`npx jest`).
- Use `renderWithProviders` from `src/test/render.tsx` when tests need the React Query and theme providers or seeded authentication state.
- Keep browser end-to-end tests in `e2e/` as Playwright specs, fixtures, and support files.

> **Verified against:** `src/features/escrow/README.md` (Jest), `src/test/`, `e2e/` at `ad2f38d7`. Status: Jest and co-location are Current. Confirm `renderWithProviders` and `e2e/` exist before relying on them.

---

## 1. Directory Structure & Layer Map (Current, with Planned items marked)

```text
src/
├── app/                 Current. Routing only: page, layout, loading, error and route files,
│                        metadata, params, auth gates.
├── features/            Current. One folder per business domain: escrow, apartments, and others.
│   └── <feature>/
│       ├── index.ts         ← the public entry point
│       ├── components/      feature UI (client or server)
│       ├── hooks/           feature hooks
│       ├── data/            repository and demo data
│       ├── model/           types, schemas, state machines, pure logic
│       └── *.test.ts(x)     co-located tests
├── components/
│   ├── ui/          shadcn primitives: stateless, no data, no auth, no wallet
│   └── layout/      app shell: Header, SideBar, DemoBanner, nav config
├── server/          server-only code: firebase-admin, SEP-10, secrets (FE-48)
├── lib/             framework-free helpers shared by ≥2 features (format, geo, utils, firebase client)
├── providers/       React providers composed per route group (FE-54)
├── config/          env.ts (client) / env.server.ts (server)
└── types/           cross-feature types only (feature types live in features/<x>/model)
```

---

## 2. Permitted vs Forbidden Import Table

| Layer                | May import                                                                                                        | Must NOT import                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `app/`               | Everything except another route's private files                                                                   | —                                                                        |
| `features/<x>`       | `components/ui`, `components/layouts`, `lib`, `config/env`, `types`, **other features only via their `index.ts`** | `app/`, `server/`, another feature's internal modules (`@/features/*/*`) |
| `components/ui`      | `lib/utils` only                                                                                                  | `features`, `hooks`, `providers`, `data`, `server/`                      |
| `components/layouts` | `components/ui`, `lib`, `features/*/index.ts` (auth state only)                                                   | `server/`, demo data                                                     |
| `server/`            | `config/env.server`, `lib`                                                                                        | Anything client (`"use client"` modules, React)                          |
| `lib/`               | `config`, `types`                                                                                                 | `features`, `components`, `server/`                                      |

> **Verified against:** `eslint.config.mjs`, `src/components/layouts/`, `src/features/` at `ad2f38d7`. Status: Current. The `server/` row is Current, since `src/server/` exists upstream.

---

## 3. Core Decision Rules (Current)

1. **Consolidate by change and runtime.** Code that changes together and needs the same runtime (wallet, escrow SDK, query client) lives in the same feature and mounts under the same route group.
2. **Isolate by trust and blast radius.** Secrets and server SDKs live on the server side, away from client code. Each route group will have its own error boundary (Planned).
3. **One way in.** A feature is consumed through its public `index.ts`. Deep imports into a feature's internal subdirectories (`@/features/<x>/components/...`) are forbidden.

- **Presentational UI isolation (`src/components/ui/**/*.{ts,tsx}`)**: Banned from importing `@/features/*`, `@/hooks/*`, `@/providers/*`, `@/server/*`, `@/lib/mockData*`, `@/lib/demo*`.
- **Feature encapsulation (`src/features/**/*.{ts,tsx}`)**: Banned from deep imports into other features (`@/features/*/*`) and cannot reach `@/server/*` or `@/app/*`.
- **Shared library purity (`src/lib/**/*.{ts,tsx}`)**: Banned from depending on `@/features/*`, `@/components/*`, or `@/server/*`.
- **Server-only boundary**: Only `src/app/api/**` and `src/server/**` may import `@/server/*`; direct `process.env` reads outside config, server, instrumentation, Next config, and tests are forbidden.
- **Module escape prevention**: Relative imports escaping module boundaries (`../../../*`) are banned across `src/**/*.{ts,tsx}` in favor of the clean `@/` path alias.

> **Verified against:** `src/features/` layout at `ad2f38d7`. Status: Current for rules 1 and 3, Planned for the per-group error boundary in rule 2. Rule 2 (server-only boundary) is Current.

Status: Current · Verified against ad2f38d7

---

## 4. ESLint Boundary Enforcement (Current, with Planned rules marked)

Rules in `eslint.config.mjs` enforce these layer boundaries:

- **Presentational UI isolation (`src/components/ui/**/*.{ts,tsx}`)**: Banned from importing `@/features/*`, `@/hooks/*`, `@/providers/*`, `@/server/*`, `@/lib/mockData*`, `@/lib/demo*`.
- **Feature encapsulation (`src/features/**/*.{ts,tsx}`)**: Banned from deep imports into other features (`@/features/*/*`) and cannot reach `@/server/*` or `@/app/*`.
- **Shared library purity (`src/lib/**/*.{ts,tsx}`)**: Banned from depending on `@/features/*`, `@/components/*`, or `@/server/*`.
- **Module escape prevention**: Relative imports escaping module boundaries (`../../../*`) are banned across `src/**/*.{ts,tsx}` in favor of the clean `@/` path alias.

---

## 5. Route Groups & Runtime Profiles (Planned)

Route groups segment the application by runtime profile, ensuring providers and heavy dependencies (such as `@creit.tech/stellar-wallets-kit` and `@trustless-work/escrow`) are mounted once per group layout rather than per page or globally at root.

### Target group profiles

| Group         | Routes                                                                                        | Providers mounted                                                             | Target first-load JS |
| ------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------- |
| `(marketing)` | `/`, `/rent`, `/rent/[id]`, `/hotels`, `/hotels/[id]`, `/hotels/search`, `/guest/suggestions` | `QueryProvider` only (RSC-first; no auth listener, no wallet kit)             | ≤ 180 kB             |
| `(auth)`      | `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`                 | `AuthProvider` (centered auth shell; wallet login loads kit lazily on click)  | ≤ 200 kB             |
| `(app)`       | `/dashboard/**`                                                                               | `AuthProvider` + `QueryProvider` + sidebar shell                              | ≤ 260 kB             |
| `(checkout)`  | `/rent/[id]/escrow/**`, `/hotels/[id]/book`, `/room`, `/bookings/**`                          | `AuthProvider` + `QueryProvider` + `WalletProviderScoped` + `EscrowProviders` | ≤ 350 kB             |

- **Root `src/app/layout.tsx`**: Thin shell containing HTML, body fonts, `globals.css`, `ThemeProvider`, `DemoBanner`, and `Toaster`. Contains **no** data, auth, or wallet providers.
- **Provider Rule**: Pages never mount providers (`grep -rn "Provider" src/app --include=page.tsx` must return 0 mounts). All providers are composed at the route group layout level.
