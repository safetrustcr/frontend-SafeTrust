# Messages feature

Guest–host messaging lives in this module (#591): the inbox on
`/dashboard/messages`, the thread on `/dashboard/messages/[conversationId]`,
the "Message host" redirect on `/dashboard/messages/new?listing=<id>`, and the
unread badge in the sidebar.

## Public API

Code outside this folder imports only `@/features/messages` (`index.ts`):

| Export                                                                | Used by                                     |
| --------------------------------------------------------------------- | ------------------------------------------- |
| `ConversationListPane`, `ConversationView`, `NewConversationRedirect` | the `/dashboard/messages` pages and layout  |
| `UnreadBadge`                                                         | `components/layouts/SideBar.tsx`            |
| `ConversationList`, `ConversationThread`                              | building blocks for other inbox views       |
| `useConversations`, `useConversation`, `startConversation`            | hooks over the repository                   |
| `MESSAGES_HREF`, `conversationHref`, `getConversationIdForApartment`  | links into messaging (`/guest/suggestions`) |
| `Conversation`, `Message`, `Participant`, `MessagesSource`            | type-only imports                           |

## Layout

| Path                 | Role                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `index.ts`           | Public API (above)                                                                          |
| `model/types.ts`     | `Conversation`, `Message`, `MessagesSource`                                                 |
| `model/routes.ts`    | Route helpers (was `src/lib/conversationRoutes.ts`)                                         |
| `data/repository.ts` | `MessagesRepository` contract and the `DEMO_MODE` switch: the only place messaging reads it |
| `data/demo.ts`       | Demo conversations seeded from the listings catalogue (was `src/lib/demo/messages.ts`)      |
| `data/live.ts`       | Stub until the messaging backend exists (GA-07)                                             |
| `hooks/`             | `useConversations`, `useConversation`: read the repository, never `DEMO_MODE`               |
| `components/`        | Inbox, thread, composer, bubbles, unread badge (was `src/components/messages`)              |

Tests sit next to the file they cover.

## Data flow and real-time updates

Hooks return `{ data, source }`, where `source` is `"demo" | "live" | "none"`.
They read the repository through `useSyncExternalStore`:

```text
useConversations ──subscribe(onChange)──▶ messagesRepository
                 ◀─listConversations(uid)─  (same array until data changes)
```

How updates reach `onChange` is the repository's choice. Components and hooks
don't know it:

- **demo**: a zustand store persisted to `sessionStorage`. `subscribe` is the
  store's own subscription. The sample threads are seeded per uid.
- **live (today)**: the same tab-local store without the samples, and
  `source: "none"`, so the composer stays disabled. This keeps the "Message host"
  flow working outside demo mode.
- **live (GA-07)**: implement `MessagesRepository` in `data/live.ts`. Use a
  Firestore `onSnapshot` listener (or a Hasura subscription) when the backend
  pushes changes, and polling with `setInterval` + `fetch` only when it can't.
  Either way, keep the latest result in a module-level cache, return it from
  `listConversations`, and call `onChange` after updating it. Then add a
  `sendMessage` method to the contract and use it from `useConversation`
  instead of the demo-only local append.

The repository must return the **same array reference** from
`listConversations` until something changes. A new array on every call makes
`useSyncExternalStore` re-render forever.

## Rules

- Inside the module, import with relative paths (`../data/repository`), never
  `@/features/messages/...`.
- `DEMO_MODE` is read only in `data/repository.ts`.
- `data/demo.ts` needs the listings catalogue, so it imports
  `@/features/listings`. Listings must not import messages, or the two barrels
  would form a cycle. Listings links to `/dashboard/messages/new?listing=<id>`
  by URL.

ESLint enforces the public API (`import/no-restricted-paths` in
`eslint.config.mjs`).
