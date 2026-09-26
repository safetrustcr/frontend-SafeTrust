<div align="center">
<img src="https://raw.githubusercontent.com/safetrustcr/frontend-SafeTrust/develop/public/img/logo.png" alt="SafeTrust Logo" width="80" />

# frontend-SafeTrust
**Decentralized P2P Escrow · Stellar Blockchain · Standalone Frontend**

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](https://opensource.org/licenses/MIT)
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

| Tool | Version |
|---|---|
| Node.js | ≥ 18 |
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

### Variable Migration (Old → New)

If you have an existing `.env.local` file, you must update the following renamed variables:

| Old Variable | New Variable | Description / Action |
| --- | --- | --- |
| `NEXT_PUBLIC_PLATFORM_WALLET` | `NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS` | Unified platform wallet address variable |
| `NEXT_PUBLIC_API_KEY` | `NEXT_PUBLIC_TRUSTLESS_API_KEY` | Renamed with explicit Trustless Work prefix |
| `NEXT_PUBLIC_TRUSTLESS_API_URL_DEV` | `NEXT_PUBLIC_TRUSTLESS_API_URL` | Folded into single variable; each environment specifies its own URL |
| `NEXT_PUBLIC_SKIP_AUTH_MIDDLEWARE` | `SKIP_AUTH_MIDDLEWARE` | Server-only switch; never public and strictly ignored when `NODE_ENV=production` |
| `NEXT_PUBLIC_WEBHOOK_URL` | *(removed)* | Unused server route `src/app/api/auth/forgot-password` deleted |

> [!NOTE]
> Client variables must begin with `NEXT_PUBLIC_` and are inlined statically at build time. Server-only secrets (like `BACKEND_URL`, `SKIP_AUTH_MIDDLEWARE`, and `TRUSTLESS_WORK_WEBHOOK_SECRET`) must **never** be prefixed with `NEXT_PUBLIC_`.

## Architecture

| Setup | When to use |
|---|---|
| **This repo standalone** — `npm run dev`, remote Hasura + Firebase | UI work, components, dashboard features — most contributor tasks |
| **`dApp-SafeTrust` monorepo** — frontend + backend together | Full-stack work touching schema, mutations, or webhook behavior |
| **`backend-SafeTrust` standalone** — Hasura + Postgres + webhook via Docker | Backend-only contributors who don't need the UI |

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
npm run test:e2e      # E2E tests (Cypress)
npm run test:coverage # coverage report
```

Tests live in `__tests__/` or as `.test.ts(x)` files. E2E tests in `cypress/e2e/`. API requests mocked via MSW (`mocks/handlers.ts`).

---

## Contributing

1. `npm run dev` — must start without errors.
2. No `console.log` in production paths, no unexplained `any` or `@ts-ignore`.
3. Link the issue your PR closes.

**Branch naming:** `feat/<issue-number>-short-description` · `fix/<issue-number>-short-description`

- [Contributing Guide](https://github.com/safetrustcr/Frontend/issues/34)
- [Git Guidelines](https://github.com/safetrustcr/Frontend/issues/35)

---

## License

© 2026 SafeTrust. Released under the [MIT License](https://opensource.org/license/MIT).
