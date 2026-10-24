# SafeTrust Architecture Contract

This document defines the architectural layers, boundaries, and import contracts for `frontend-SafeTrust`. ESLint enforces these boundaries via `eslint.config.mjs` to keep the codebase maintainable, secure, and predictable.

---

## Test and Mock Conventions

- Keep unit and integration tests co-located with their subjects as
  `*.test.ts` or `*.test.tsx` files under `src/`; do not add `__tests__`
  directories.
- Reserve the root `__mocks__/` directory for Jest manual package mocks. Keep
  demo data and fixtures with their features, and shared test helpers in
  `src/test/`.
- Use `renderWithProviders` from `src/test/render.tsx` when tests need the
  React Query and theme providers or seeded authentication state.
- Keep browser end-to-end tests in `e2e/` as Playwright specs, fixtures, and
  support files.

---

## 1. Directory Structure & Layer Map

```text
src/
├── app/            Routing only: page/layout/loading/error/route files, metadata, params,
│                   auth gates. Pages are thin Server Components (FE-56).
├── features/       One folder per business domain: escrow, listings, messages, auth, dashboard.
│   └── <feature>/
│       ├── index.ts         ← the ONLY public entry point
│       ├── components/      feature UI (client or server)
│       ├── hooks/           feature hooks
│       ├── data/            repository + demo data (FE-50)
│       ├── model/           types, schemas (zod), state machines, pure logic
│       └── *.test.ts(x)     co-located tests (FE-58)
├── components/
│   ├── ui/          shadcn primitives: stateless, no data, no auth, no wallet
│   └── layout/      app shell: Header, SideBar, DemoBanner, nav config
├── server/          server-only code: firebase-admin, SEP-10, secrets (FE-48)
├── lib/             framework-free helpers shared by ≥2 features (format, geo, utils, firebase client)
├── providers/       React providers composed per route group (FE-54)
├── config/          env.ts (client) / env.edge.ts (Edge-safe) / env.server.ts (server)
└── types/           cross-feature types only (feature types live in features/<x>/model)
```

See [`src/server/README.md`](../src/server/README.md) for the server-only
boundary, secret handling, and the reason the Edge-compatible ID-token verifier
remains in `lib/`.

---

## 2. Permitted vs Forbidden Import Table

| Layer               | May import                                                                                                       | Must NOT import                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `app/`              | Everything except another route's private files                                                                  | —                                                                        |
| `features/<x>`      | `components/ui`, `components/layout`, `lib`, `config/env`, `types`, **other features only via their `index.ts`** | `app/`, `server/`, another feature's internal modules (`@/features/*/*`) |
| `components/ui`     | `lib/utils` only                                                                                                 | `features`, `hooks`, `providers`, `data`, `server/`                      |
| `components/layout` | `components/ui`, `lib`, `features/*/index.ts` (auth state only)                                                  | `server/`, demo data                                                     |
| `server/`           | `config/env.server`, `lib`                                                                                       | Anything client (`"use client"` modules, React)                          |
| `lib/`              | `config`, `types`                                                                                                | `features`, `components`, `server/`                                      |

---

## 3. Core Decision Rules

1. **Consolidate by change and runtime:**
   Code that changes together and needs the same runtime (wallet, escrow SDK, query client) lives in the same feature and mounts under the same route group (FE-54).
2. **Isolate by trust and blast radius:**
   Secrets and server SDKs live in `server/` (FE-48); each route group has its own error boundary (FE-55).
3. **One way in:**
   A feature is consumed through its public `index.ts`; deep imports into a feature's internal subdirectories (`@/features/<x>/components/...`) are forbidden and enforced as ESLint errors.
4. **Pages are composition roots (FE-56):**
   Every `src/app/**/page.tsx` is a Server Component. Pages read route params,
   load data through feature repositories, handle `notFound()`/`redirect()`,
   export public-route metadata, and render feature components through their
   public `index.ts`. Keep client state, effects, and `useSearchParams` inside
   feature components; wrap components that use `useSearchParams` in `Suspense`
   from the page. Do not use `force-dynamic` solely to avoid a client-side
   rendering bailout. `npm run lint` rejects `"use client"` in route pages
   outside the shrinking migration allowlist maintained in
   `scripts/check-thin-pages.mjs`.

---

## 4. ESLint Boundary Enforcement

ESLint rules in `eslint.config.mjs` enforce these layer boundaries automatically:

- **Presentational UI isolation (`src/components/ui/**/*.{ts,tsx}`)**: Banned from importing `@/features/*`, `@/hooks/*`, `@/providers/*`, `@/server/*`, `@/lib/mockData*`, `@/lib/demo*`.
- **Feature encapsulation (`src/features/**/*.{ts,tsx}`)**: Banned from deep imports into other features (`@/features/*/*`) and cannot reach `@/server/*` or `@/app/*`.
- **Shared library purity (`src/lib/**/*.{ts,tsx}`)**: Banned from depending on `@/features/*`, `@/components/*`, or `@/server/*`.
- **Server-only boundary**: Only `src/app/api/**` and `src/server/**` may import `@/server/*`; direct `process.env` reads outside config, server, instrumentation, Next config, and tests are forbidden.
- **Module escape prevention**: Relative imports escaping module boundaries (`../../../*`) are banned across `src/**/*.{ts,tsx}` in favor of the clean `@/` path alias.

---

## 5. Route Groups & Runtime Profiles (FE-54)

Route groups segment the application by runtime profile, ensuring providers and heavy dependencies (such as `@creit.tech/stellar-wallets-kit` and `@trustless-work/escrow`) are mounted once per group layout rather than per page or globally at root.

### Group Profiles & Mounted Providers

| Group         | Routes                                                                                        | Providers Mounted                                                             | Target First-Load JS |
| ------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------- |
| `(marketing)` | `/`, `/rent`, `/rent/[id]`, `/hotels`, `/hotels/[id]`, `/hotels/search`, `/guest/suggestions` | `QueryProvider` only (RSC-first; no auth listener, no wallet kit)             | ≤ 180 kB             |
| `(auth)`      | `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`                 | `AuthProvider` (centered auth shell; wallet login loads kit lazily on click)  | ≤ 200 kB             |
| `(app)`       | `/dashboard/**`                                                                               | `AuthProvider` + `QueryProvider` + sidebar shell                              | ≤ 260 kB             |
| `(checkout)`  | `/rent/[id]/escrow/**`, `/hotels/[id]/book`, `/room`, `/bookings/**`                          | `AuthProvider` + `QueryProvider` + `WalletProviderScoped` + `EscrowProviders` | ≤ 350 kB             |

- **Root `src/app/layout.tsx`**: Thin shell containing HTML, body fonts, `globals.css`, `ThemeProvider`, `DemoBanner`, and `Toaster`. Contains **no** data, auth, or wallet providers.
- **Provider Rule**: Pages never mount providers (`grep -rn "Provider" src/app --include=page.tsx` must return 0 mounts). All providers are composed at the route group layout level.
