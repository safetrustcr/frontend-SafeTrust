# Issue #666: offers overview and string property IDs

Issue: [safetrustcr/frontend-SafeTrust#666](https://github.com/safetrustcr/frontend-SafeTrust/issues/666).

Branch: `feat/issue-666-offers-overview`, originally based on `develop` at
`0acb5acbd140d9d0372546be4728064d2c61e133` and synchronized with
`3a1d78067cb5a76ffacb8c30eb80142eda22eaa6` before opening the PR.
The PR must target `develop`.

## Project and implementation

- The application uses Next.js App Router, React, TypeScript and Tailwind.
  Routes remain Server Components; the offers screens are exported through
  `src/features/dashboard/index.ts`, following the thin-page check.
- Dashboard routes already use the authentication middleware. Host permissions
  and future owner scoping remain backend responsibilities. This change uses
  the existing demo owner's mock properties and does not introduce live queries.
- The overview contains one link per property, with its name, address and actual
  rental-offer count. Counts come from `MOCK_RENTAL_OFFERS`, not the stale
  `Apartment.offers` summaries. Applicant details remain in the existing table
  on the property page.
- Both pages show the Demo badge and profile navigation. Missing properties,
  loading, errors, no properties and properties without offers have distinct
  states. String IDs, including UUIDs, are never converted to numbers, and a
  missing property does not trigger navigation during render.
- Tailwind now scans `src/features`, ensuring the feature's responsive classes
  are generated. Property summaries wrap in narrow layouts and use theme tokens.

## Automated coverage

| Area                     | Tests                                                                                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Overview hook            | Counts, zero offers, no properties, string/UUID IDs, address fallback, no applicant fields                                         |
| Overview screen          | Listing action, linked rows, encoded IDs, singular/plural counts, loading and error states                                         |
| Property hook and screen | Existing IDs and UUIDs, missing properties without redirects or console errors, loading/error precedence, existing applicant table |
| Profile sidebar          | Exact overview route, property offer routes and unrelated sibling routes                                                           |
| E2E                      | Profile sidebar → overview → property applicants → overview → property without offers; unknown UUID → back to overview             |

The 31 new unit tests run as part of the full Jest suite. The four new E2E cases
run on mobile (390 × 844, light) and desktop (1280 × 800, dark), use the shared
console-error checks, audit accessibility with axe, check horizontal overflow,
and exercise a property row with the keyboard. Screenshots and videos are saved
in `test-results/` by `e2e/offers.spec.ts`.

## Local validation

Validation date: 2026-10-21. Environment: Windows, Node 22.12.0, npm 10.9.2.

| Check                                                                                | Result                                                                                                             |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `npm run check`                                                                      | Passed after synchronization: zero-warning lint, TypeScript, 82 Jest suites / 545 tests, Knip and production build |
| `PW_REUSE_SERVER=1 npm run test:e2e -- --workers=2 --output=test-results/after-sync` | Passed after synchronization: all 88 mobile/desktop cases in 2.0 minutes                                           |
| Lighthouse CI                                                                        | Historical comparison fails on both the original base and the issue branch; see below                              |

The production build was completed separately with the exact demo/emulator
environment in `playwright.config.ts`, then served on port 3100. Automatic
startup attempts exceeded both 180 and 300 seconds on this Windows machine;
the successful browser run used the project's existing `PW_REUSE_SERVER=1`
option against that fresh production build. All browser tests were executed.

The latest run includes the apartment CRUD scenarios introduced by `develop`.
The merge preserves those changes, the Server Component wrappers for edit and
offers routes, and the string-keyed offers mock. The three merge conflicts were
resolved without changing the issue's mock-data scope. `develop` at `3a1d780`
is an ancestor of the final branch, so this comparison has no merge conflicts.

The repeatable local evidence is retained in:

- `test-results/issue-666/quality-after-sync.log`
- `test-results/issue-666/production-build-after-sync.log`
- `test-results/issue-666/e2e-after-sync.log`
- `test-results/after-sync/offers-*/` (screenshots and browser recordings)

The existing Jest suite still emits `act(...)` warnings from unrelated tests.
The new not-found test explicitly checks for console errors, and Playwright
checks browser console errors through the shared fixture.

## CI audit and baseline findings

`.github/workflows/ci.yml` runs quality and Playwright jobs. The Lighthouse
workflow audits `/`, `/rent` and `/login`, twice each, with the mobile preset.
No workflow assertions or performance thresholds were changed.

Validation exposed and fixed existing portability problems:

- The guest palette guard used POSIX shell quoting and `|| true`. It now invokes
  Git with an argument array and checks the exit status explicitly. The guard
  then exposed a pre-existing orange focus ring, now replaced with `ring-ring`.
- CRLF in Husky scripts caused Knip to parse a carriage return as part of the
  binary name. `.gitattributes` keeps these scripts on LF.
- The glass E2E test assumed Linux separators in Next.js's generated manifest.
  It now normalizes separators while still requiring the expected chunk.
- A cold production build exceeded Playwright's three-minute server startup
  budget on Windows. It now has five minutes, within the CI job's fifteen-minute
  budget. Test assertions and individual test timeouts are unchanged.

Before the synchronization with `develop`, Lighthouse was reproduced in a
separate checkout of the original unmodified base (`0acb5ac`) using
the same installed dependencies, Chrome and workflow settings. Both revisions
fail the existing performance, LCP and TBT assertions; CLS stays below 0.1.
The required thresholds remain performance ≥ 0.85, LCP ≤ 2500 ms and TBT ≤ 300 ms.

| Page     | Base performance range | Issue performance range |
| -------- | ---------------------- | ----------------------- |
| `/`      | 0.51–0.63              | 0.53–0.57               |
| `/rent`  | 0.47–0.53              | 0.47–0.50               |
| `/login` | 0.49–0.51              | 0.49–0.51               |

These are local measurements, not GitHub Actions results. They demonstrate an
existing performance failure and do not establish that the Lighthouse workflow
will pass on the PR. Lighthouse was not remeasured after the `develop` merge.
The raw HTML/JSON reports and command logs are retained with
the local validation artifacts under `test-results/issue-666/`.
