# SafeTrust Architecture Contract

This document defines the architectural layers, boundaries, and import contracts for `frontend-SafeTrust`. ESLint enforces these boundaries via `eslint.config.mjs` to keep the codebase maintainable, secure, and predictable.

Each section is labelled **Current**, **Demo**, or **Planned**. Planned items are targets, not rules the build enforces yet.

---

## Test and Mock Conventions (Current)

- Keep unit and integration tests co-located with their subjects as `*.test.ts` or `*.test.tsx` files under `src/`. Do not add `__tests__` directories.
- Keep demo data and fixtures with their features. Keep shared test helpers in `src/test/`, and Jest mocks for npm packages in `src/test/__mocks__/`.
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
├── features/            Current. One folder per business domain: escrow, listings, apartments, and others.
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

**Where does this file go?** If one feature or component uses it, keep it inside that feature or next to that component. Move it to shared `hooks/`, `lib/` or `components/` once a second consumer needs it. There is no `redux/`, `services/`, `context/` or `pages/` folder: `core/store` holds global state, `lib` holds service wrappers, `providers` holds context, and `app` holds pages.

1. **Consolidate by change and runtime:**
   Code that changes together and needs the same runtime (wallet, escrow SDK, query client) lives in the same feature and mounts under the same route group (FE-54).
2. **Isolate by trust and blast radius:**
   Secrets and server SDKs live in `server/` (FE-48); each route group has its own error boundary (FE-55).
3. **One way in:**
   A feature is consumed through its public `index.ts`; deep imports into a feature's internal subdirectories (`@/features/<x>/components/...`) are forbidden and enforced as ESLint errors.
   `src/features/help` is the one exception: its server content and Markdown renderer stay out of the barrel that the client `/rent` page imports.
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

> **Verified against:** `src/features/` layout at `ad2f38d7`. Status: Current for rules 1 and 3, Planned for the per-group error boundary in rule 2. Rule 2 (server-only boundary) is Current.

Status: Current · Verified against ad2f38d7

---

## 4a. Listings and Hotels (Current)

`src/features/listings` is the one module for stays: apartments on `/rent`,
hotels on `/hotels`, the `/room` detail and booking UI, search, filters and
the wishlist (FE-52). See `src/features/listings/README.md` for its layout and
public API.

**Decision: hotels live in `features/listings`, not in a `features/hotels`.**

- Hotels and apartments are the same records. `/hotels`, `/hotels/[id]` and
  `/hotels/[id]/book` render `Listing` values from the same catalogue as
  `/rent` (the old `STUB_HOTELS` was an alias of `APARTMENT_LISTINGS`), and
  they share the price, map and card building blocks.
- There is no `kind: "apartment" | "hotel"` discriminator yet, because every
  hotel shown today is also an apartment and nothing branches on the kind.
  Add the discriminator to `model/types.ts` when the backend has a separate
  hotel record. Until then it would be a field without a source.
- The host-side demo hotel store (`/dashboard/hotels`) is exported as
  `useDemoHotelStore`. Host forms stay in `src/components/dashboard/**` and
  read listings through `@/features/listings`; a `features/host` is created
  only when those forms move.
- `src/features/apartments` (the FE-50 owned-apartments repository used by
  `/dashboard/apartments`) and `src/features/location` (the browser
  geolocation store) are separate modules: they are write and device
  concerns, not the listing read model.

`Listing` and `Destination` are defined in `features/listings/model/types.ts`.
Shared code outside the feature imports them from `@/features/listings`; `lib/`
may not. Demo conversations are seeded from the catalogue, so they live in
`features/messages/data/demo.ts` (#591) rather than in `lib/demo`.
`GeoPoint` stays in `src/types/geo.ts` because `lib/geo.ts` needs it.

> **Verified against:** `src/features/listings/`, `eslint.config.mjs`
> (`import/no-restricted-paths`), `next.config.ts` (`optimizePackageImports`).
> Status: Current.

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
