# SafeTrust Architecture Contract

This document defines the architectural layers, boundaries, and import contracts for `frontend-SafeTrust`. ESLint enforces these boundaries via `eslint.config.mjs` to keep the codebase maintainable, secure, and predictable.

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
├── config/          env.ts (client) / env.server.ts (server)
└── types/           cross-feature types only (feature types live in features/<x>/model)
```

---

## 2. Permitted vs Forbidden Import Table

| Layer | May import | Must NOT import |
|---|---|---|
| `app/` | Everything except another route's private files | — |
| `features/<x>` | `components/ui`, `components/layout`, `lib`, `config/env`, `types`, **other features only via their `index.ts`** | `app/`, `server/`, another feature's internal modules (`@/features/*/*`) |
| `components/ui` | `lib/utils` only | `features`, `hooks`, `providers`, `data`, `server/` |
| `components/layout` | `components/ui`, `lib`, `features/*/index.ts` (auth state only) | `server/`, demo data |
| `server/` | `config/env.server`, `lib` | Anything client (`"use client"` modules, React) |
| `lib/` | `config`, `types` | `features`, `components`, `server/` |

---

## 3. Core Decision Rules

1. **Consolidate by change and runtime:**
   Code that changes together and needs the same runtime (wallet, escrow SDK, query client) lives in the same feature and mounts under the same route group (FE-54).
2. **Isolate by trust and blast radius:**
   Secrets and server SDKs live in `server/` (FE-48); each route group has its own error boundary (FE-55).
3. **One way in:**
   A feature is consumed through its public `index.ts`; deep imports into a feature's internal subdirectories (`@/features/<x>/components/...`) are forbidden and enforced as ESLint errors.

---

## 4. ESLint Boundary Enforcement

ESLint rules in `eslint.config.mjs` enforce these layer boundaries automatically:

- **Presentational UI isolation (`src/components/ui/**/*.{ts,tsx}`)**: Banned from importing `@/features/*`, `@/hooks/*`, `@/providers/*`, `@/server/*`, `@/lib/mockData*`, `@/lib/demo*`.
- **Feature encapsulation (`src/features/**/*.{ts,tsx}`)**: Banned from deep imports into other features (`@/features/*/*`) and cannot reach `@/server/*` or `@/app/*`.
- **Shared library purity (`src/lib/**/*.{ts,tsx}`)**: Banned from depending on `@/features/*`, `@/components/*`, or `@/server/*`.
- **Module escape prevention**: Relative imports escaping module boundaries (`../../../*`) are banned across `src/**/*.{ts,tsx}` in favor of the clean `@/` path alias.
