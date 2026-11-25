# Server-only code

`src/server/` contains code that handles credentials or privileged services and
must never enter a browser bundle. Every implementation module imports
`server-only`; only API route handlers and other server-side code may import
through `@/server`.

Firebase Admin credentials, SEP-10 signing and challenge/session storage belong
here. Configuration is read lazily through `serverEnv` from
`src/config/env.server.ts`.

`src/lib/auth/verify-id-token.ts` intentionally remains in `lib/`: it verifies
Firebase ID tokens with public Google JWKS and contains no secret or Admin SDK.
The Edge middleware and tests use this verifier, so it remains runtime-neutral.
