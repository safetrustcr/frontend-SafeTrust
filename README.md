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
| Node.js | 20.18 - 22.x |
| npm | 10.9.2 |
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

Enable **Email/Password** under **Authentication → Sign-in method**.

> These are public, browser-safe values. The `NEXT_PUBLIC_` prefix is what makes Next.js expose them to the bundle. **Never put `HASURA_ADMIN_SECRET` here** — the frontend authenticates via Firebase JWT, not the admin secret.

**Setup:** [console.firebase.google.com](https://console.firebase.google.com)

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
NEXT_PUBLIC_API_URL=https://api.trustlesswork.com
NEXT_PUBLIC_API_KEY=
NEXT_PUBLIC_TRUSTLESS_API_URL=https://api.trustlesswork.com
NEXT_PUBLIC_TRUSTLESS_API_URL_DEV=https://dev.api.trustlesswork.com
NEXT_PUBLIC_TRUSTLESS_NETWORK=testnet
```

**Get your API key:**
1. Go to [dapp.trustlesswork.com](https://dapp.trustlesswork.com) → connect Freighter.
2. **Settings → Profile** → fill in use-case field (required).
3. **Settings → API Keys** → Request API Key → select **Testnet**.
4. Copy immediately — shown only once.

Always use `testnet` for local development. Full guide: [docs.trustlesswork.com → Request API Key](https://docs.trustlesswork.com/trustless-work/introduction/developer-resources/request-api-key)

---

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

**Branch naming:** `feat/<issue-number>-short-description` · `fix/<issue-number>-short-description`

- [Contributing Guide](https://github.com/safetrustcr/Frontend/issues/34)
- [Git Guidelines](https://github.com/safetrustcr/Frontend/issues/35)

---

## License

© 2026 SafeTrust. Released under the [MIT License](https://opensource.org/license/MIT).
