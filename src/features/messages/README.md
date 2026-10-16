# Messages feature

Conversation screens depend on the feature repository through the hooks in
`hooks/`. The repository is the only messaging module that reads
`NEXT_PUBLIC_DEMO_MODE`; UI components and hooks receive data and its
`demo`/`live`/`none` source from that boundary.

`data/live.ts` is a stub until the messaging backend is available. When live
messages are added, use a Firestore listener for conversation and message
updates: it provides ordered, low-latency updates and avoids repeated polling.
Keep that subscription inside the repository adapter so the screens and
components can remain unchanged if the backend transport changes.
