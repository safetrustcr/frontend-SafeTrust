<div align="center">
<img src="https://raw.githubusercontent.com/safetrustcr/frontend-SafeTrust/develop/public/img/logo.png" alt="SafeTrust Logo" width="80" />

# frontend-SafeTrust

**Decentralized P2P Escrow · Stellar Blockchain · Standalone Frontend**

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/safetrustcr/frontend-SafeTrust/actions/workflows/ci.yml/badge.svg)](https://github.com/safetrustcr/frontend-SafeTrust/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Hasura](https://img.shields.io/badge/Hasura-GraphQL-1EB4D4?logo=hasura)](https://hasura.io)
[![Stellar](https://img.shields.io/badge/Stellar-Blockchain-7B2BF9?logo=stellar)](https://stellar.org)
[![🔥 Firebase](https://img.shields.io/badge/🔥_Firebase-Auth-FFCA28)](https://firebase.google.com/)
[![🔐 TrustlessWork](https://img.shields.io/badge/🔐_TrustlessWork-EaaS-00C2A8)](https://docs.trustlesswork.com/trustless-work)

</div>

---

## What is SafeTrust?

SafeTrust is a decentralized P2P escrow platform for rental transactions. Funds are held in tamper-proof smart contracts on the **Stellar network** via the **[TrustlessWork API](https://docs.trustlesswork.com)** — no intermediaries, full on-chain transparency.

> 🧩 **This repo runs standalone.** You do not need to clone or run `backend-SafeTrust` locally. The frontend connects directly to a remote Hasura GraphQL endpoint and Firebase over the network.

---

## Quick Start

### Prerequisites

| Tool             | Version                                        |
| ---------------- | ---------------------------------------------- |
| Node.js          | 20.18 - 22.x                                   |
| npm              | 10.9.2                                         |
| A Stellar wallet | [Freighter](https://freighter.app) recommended |

### 1. Clone and install

```bash
git clone https://github.com/<your_user>/frontend-SafeTrust
cd frontend-SafeTrust
git remote add upstream https://github.com/safetrustcr/frontend-SafeTrust
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` following the sections below. Never commit this file.

### 3. Start the dev server

```bash
npm run dev
```

Runs on **port 3000** by default. Use `npm run dev -- --port 3001` only if `landing-SafeTrust` is already running on 3000.

---

## Environment Variables

The project uses a typed, validated environment variable contract (`src/config/env.ts` for client-safe variables and `src/config/env.server.ts` for server-only variables).

Refer to [.env.example](.env.example) as the single reference for all environment configuration. Copy `.env.example` to `.env.local` to configure your local development environment:

```bash
cp .env.example .env.local
```

### 🔥 Firebase

From **Firebase Console → Project Settings → Your apps → Web app → Config**:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Enable **Email/Password** and **Google** under **Authentication → Sign-in method**:

1. **Google Sign-In:** Under **Authentication → Sign-in method → Google**, click **Enable**, configure the project support email, and save.
2. **Authorized Domains:** Under **Authentication → Settings → Authorized domains**, ensure `localhost`, your Vercel preview domain pattern (`*.vercel.app`), and your production domain are added.
3. **Redirect Flow & Safari / Strict Cookie Isolation:** When popups are blocked or for browsers blocking third-party storage (Safari ITP, Firefox Strict), set `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` to your application domain and configure the Next.js rewrite in `next.config.ts` (`/__/auth/:path*` -> `https://<FIREBASE_PROJECT_ID>.firebaseapp.com/__/auth/:path*`).
4. **Google Cloud Console Authorized Redirect URI:** If using a custom auth domain (rewriting `/__/auth/*`), add `https://<application-domain>/__/auth/handler` under **Authorized redirect URIs** for your Web client OAuth ID in the Google Cloud Console (**APIs & Services → Credentials**) to prevent `redirect_uri_mismatch` errors.

> These are public, browser-safe values. The `NEXT_PUBLIC_` prefix is what makes Next.js expose them to the bundle. **Never put `HASURA_ADMIN_SECRET` here** — the frontend authenticates via Firebase JWT, not the admin secret.

### Freighter SEP-10 wallet sign-in

Freighter login uses server-side SEP-10 challenge signing and Firebase custom
tokens. Set these variables in the deployment environment (for GitHub Actions,
use repository or environment secrets). They must not use the `NEXT_PUBLIC_`
prefix:

```dotenv
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
STELLAR_AUTH_SECRET=
STELLAR_AUTH_HOME_DOMAIN=
STELLAR_AUTH_WEB_AUTH_DOMAIN=
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=
WALLET_AUTH_ALLOWED_ORIGINS=
```

The Firebase service account needs Firebase Authentication permissions to mint
custom tokens and access to Firestore. Enable Firestore and configure a TTL
policy for `stellarWalletChallenges.expiresAt`; challenges are also checked for
expiry and deleted atomically after use. Fund the Stellar auth-server account on
the selected network before using it. `WALLET_AUTH_ALLOWED_ORIGINS` is an
optional comma-separated list; the request's own origin is allowed by default.
**Setup:** [console.firebase.google.com](https://console.firebase.google.com)

---

### Variable Migration (Old → New)

If you have an existing `.env.local` file, you must update the following renamed variables:

| Old Variable                        | New Variable                          | Description / Action                                                             |
| ----------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_PLATFORM_WALLET`       | `NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS` | Unified platform wallet address variable                                         |
| `NEXT_PUBLIC_API_KEY`               | `NEXT_PUBLIC_TRUSTLESS_API_KEY`       | Renamed with explicit Trustless Work prefix                                      |
| `NEXT_PUBLIC_TRUSTLESS_API_URL_DEV` | `NEXT_PUBLIC_TRUSTLESS_API_URL`       | Folded into single variable; each environment specifies its own URL              |
| `NEXT_PUBLIC_SKIP_AUTH_MIDDLEWARE`  | `SKIP_AUTH_MIDDLEWARE`                | Server-only switch; never public and strictly ignored when `NODE_ENV=production` |
| `NEXT_PUBLIC_WEBHOOK_URL`           | _(removed)_                           | Unused server route `src/app/api/auth/forgot-password` deleted                   |

> [!NOTE]
> Client variables must begin with `NEXT_PUBLIC_` and are inlined statically at build time. Server-only secrets (like `BACKEND_URL` and `SKIP_AUTH_MIDDLEWARE`) must **never** be prefixed with `NEXT_PUBLIC_`.

---

### 🌐 Hasura GraphQL

```dotenv
NEXT_PUBLIC_HASURA_GRAPHQL_URL=https://your-hasura-instance.example.com/v1/graphql
```

Point this at the shared SafeTrust Hasura instance — or `http://localhost:8080/v1/graphql` if you are running `backend-SafeTrust` locally. No admin secret goes here, ever.

---

### 🔐 TrustlessWork API

Required for escrow deploy, fund, and release flows.

```dotenv
NEXT_PUBLIC_TRUSTLESS_API_URL=https://dev.api.trustlesswork.com
NEXT_PUBLIC_TRUSTLESS_API_KEY=
NEXT_PUBLIC_API_KEY=
NEXT_PUBLIC_TRUSTLESS_NETWORK=testnet
```

`NEXT_PUBLIC_TRUSTLESS_API_URL` is defined in `src/config/env.ts` as an optional configuration (e.g. for custom proxies or local mock servers). For standard development and booking flows, `EscrowProviders` automatically derives the active escrow API base URL directly from the Stellar network the wallet kit signs on (`STELLAR_NETWORK` in `src/features/escrow/config.ts`; testnet → `https://dev.api.trustlesswork.com`), ensuring transactions match the wallet network.

**Get your API key:**

1. Go to [dapp.trustlesswork.com](https://dapp.trustlesswork.com) → connect Freighter.
2. **Settings → Profile** → fill in use-case field (required).
3. **Settings → API Keys** → Request API Key → select **Testnet**.
4. Copy immediately — shown only once.

Always use `testnet` for local development. Full guide: [docs.trustlesswork.com → Request API Key](https://docs.trustlesswork.com/trustless-work/introduction/developer-resources/request-api-key)

---

## Architecture

| Setup                                                                       | When to use                                                      |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **This repo standalone** — `npm run dev`, remote Hasura + Firebase          | UI work, components, dashboard features — most contributor tasks |
| **`dApp-SafeTrust` monorepo** — frontend + backend together                 | Full-stack work touching schema, mutations, or webhook behavior  |
| **`backend-SafeTrust` standalone** — Hasura + Postgres + webhook via Docker | Backend-only contributors who don't need the UI                  |

---

## Tech Stack

- **Frontend:** TypeScript, Next.js 15, Tailwind CSS
- **Auth:** Firebase Authentication
- **GraphQL:** Apollo Client 4, Hasura GraphQL Engine
- **Blockchain:** Stellar, TrustlessWork API
- **Wallets:** Freighter, Albedo, LOBSTR

---

## Testing

```bash
npm test              # unit and integration tests
npm run test:ci       # CI test run with coverage
npm run typecheck     # TypeScript validation
npm run lint          # ESLint
npm run check         # lint, typecheck, tests, and production build
```

Tests live in `__tests__/` or as `.test.ts(x)` files. npm is the supported
package manager; the repository pins its expected Node and npm versions in
`.nvmrc` and `package.json`.

---

## Contributing

1. `npm run dev` — must start without errors.
2. No `console.log` in production paths, no unexplained `any` or `@ts-ignore`.
3. Link the issue your PR closes.

Run `npm run check` before opening a PR. CI also enforces zero ESLint warnings.

**Branch naming:** `feat/<issue-number>-short-description` · `fix/<issue-number>-short-description`

- [Contributing Guide](https://github.com/safetrustcr/Frontend/issues/34)
- [Git Guidelines](https://github.com/safetrustcr/Frontend/issues/35)

---

## License

© 2026 SafeTrust. Released under the [MIT License](https://opensource.org/license/MIT).
