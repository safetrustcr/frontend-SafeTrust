# Actualización de dependencias y corrección del entorno

**Fecha:** 2026-03-28

## Problema inicial

El proyecto no podía instalarse ni levantarse debido a múltiples problemas acumulados:

- Coexistencia de `package-lock.json` (npm) y `yarn.lock` (yarn) generando conflictos
- `yarn.lock` desincronizado con `package.json`
- `node_modules` inexistente
- `@types/react: "19.0.12"` con `react: "^18.2.0"` — versiones incompatibles
- `react-day-picker: "^9.6.6"` cuando el código usa la API de v8
- Hooks de Apollo Client (`useQuery`, `useMutation`, `useSubscription`) importados desde `@apollo/client` en lugar de `@apollo/client/react` (cambio de Apollo Client v4)
- `reset-password/page.tsx` sin `export default` (error de Next.js)
- Dependencias no utilizadas en `package.json`

---

## Cambios realizados

### 1. Limpieza de gestores de paquetes

- Eliminado `package-lock.json` — el proyecto usa `yarn` (definido en `packageManager`)
- Eliminado `yarn.lock` desactualizado para regenerarlo limpio

### 2. Correcciones en `package.json`

| Paquete | Antes | Después | Motivo |
|---|---|---|---|
| `react` | `^18.2.0` | `^18.3.1` | Última versión estable de React 18 |
| `react-dom` | `^18.2.0` | `^18.3.1` | Igual que react |
| `next` | `^15.3.0` | `^15.5.14` | Última versión estable de Next 15 |
| `react-day-picker` | `^9.6.6` | `^8.10.1` | El código usa API v8 (classNames snake_case) |
| `@types/react` | `19.0.12` | `^18.3.9` | Debe coincidir con React 18 instalado |
| `@types/react-dom` | `^19` | `^18.3.1` | Igual que @types/react |
| `eslint-config-next` | `15.1.7` | `^15.5.14` | Debe coincidir con la versión de Next |
| `@trustless-work/blocks` | `^1.0.0` | `^1.2.3` | Bump menor disponible |

### 3. Dependencias eliminadas (no utilizadas en el código)

- `qrcode.react` — el código importa solo `react-qr-code`
- `react-datepicker` — cero imports encontrados
- `react-dropzone` — cero imports encontrados
- `react-router-dom` — el proyecto usa `next/navigation` exclusivamente
- `@walletconnect/web3-provider` — deprecado v1, reemplazado por `@walletconnect/ethereum-provider` v2

### 4. Instalación

```bash
yarn install  # 1977 paquetes instalados, ~134 MB
```

### 5. Correcciones en código fuente

#### Apollo Client v4 — hooks movidos a subpath

En Apollo Client v4, los hooks de React se movieron de `@apollo/client` a `@apollo/client/react`.

Archivos corregidos:

- [src/app/test-page/page.tsx](../src/app/test-page/page.tsx)
- [src/components/ApolloTestComponent.tsx](../src/components/ApolloTestComponent.tsx)
- [src/components/EscrowList.tsx](../src/components/EscrowList.tsx)
- [src/components/notifications/ActivityFeed.tsx](../src/components/notifications/ActivityFeed.tsx)
- [src/hooks/useEscrowSubscription.ts](../src/hooks/useEscrowSubscription.ts)
- [src/hooks/usePaymentSubscription.ts](../src/hooks/usePaymentSubscription.ts)

```ts
// Antes
import { useQuery, useMutation } from "@apollo/client";

// Después
import { useQuery, useMutation } from "@apollo/client/react";
```

#### `reset-password/page.tsx` — faltaba export default

Next.js 15 requiere que cada `page.tsx` tenga un `export default`. Además, `useSearchParams()` requiere un `Suspense` boundary.

```tsx
// Añadido al final del archivo
export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
```

#### Stub de GraphQL generated

El directorio `src/graphql/generated/` no existía (requiere codegen contra Hasura). Se creó un stub mínimo para permitir que el servidor de desarrollo inicie:

```ts
// src/graphql/generated/index.ts
export function graphql(query: TemplateStringsArray | string): any {
  return query;
}
```

---

## Estado final

| | Estado |
|---|---|
| `yarn install` | ✅ Funciona |
| `yarn dev` | ✅ Funciona |
| `yarn build` | ⚠️ Errores de TS preexistentes en archivos de hotels y test-page (no bloquean dev) |
| GraphQL / Hasura | ⏳ Requiere `yarn docker:up` + `yarn codegen` |
| WalletConnect | ⏳ Requiere `NEXT_PUBLIC_WC_PROJECT_ID` en `.env` |

---

## Pasos para completar la configuración

```bash
# 1. Levantar Hasura con Docker
yarn docker:up

# 2. Generar tipos de GraphQL
yarn codegen

# 3. Añadir el Project ID de WalletConnect en .env
NEXT_PUBLIC_WC_PROJECT_ID=tu_id_aqui

# 4. Correr el proyecto
yarn dev
```

> Obtener un Project ID gratuito en https://cloud.walletconnect.com

---

## Dependencias que NO se actualizaron (y por qué)

| Paquete | Versión actual | Última | Motivo para no actualizar |
|---|---|---|---|
| `react` / `react-dom` | 18.x | 19.x | React 19 requeriría migrar `react-leaflet` v5, `vaul` v1 y revisar todos los Radix UI |
| `next` | 15.x | 16.x | Next 16 es muy reciente, sin estabilidad probada en producción |
| `zod` | 3.x | 4.x | Zod v4 tiene un sistema de errores y API diferente; 10+ schemas en el código |
| `@hookform/resolvers` | 3.x | 5.x | v5 requiere react-hook-form v8 (aún no existe estable) |
| `react-router-dom` | — | — | Eliminado; el proyecto no lo usa |
| `i18next` / `react-i18next` | 24.x / 15.x | 26.x / 17.x | v25+ es ESM-only y cambia la API de inicialización |
| `@creit.tech/stellar-wallets-kit` | 1.x | 2.x | v2 reestructura los módulos de wallets |
| `@stellar/freighter-api` | 3.x | 6.x | v4+ cambia el shape de retorno de `signTransaction` |
| `@trustless-work/escrow` | 2.x | 3.x | v3 elimina campos usados en el código (`newFlag`, etc.) |
| `tailwind-merge` | 2.x | 3.x | v3 cambia el sistema de configuración |
| `vaul` | 0.9.x | 1.x | v1 apunta a React 19 |
| `react-leaflet` | 4.x | 5.x | v5 requiere React 19 (peer dep obligatorio) |
