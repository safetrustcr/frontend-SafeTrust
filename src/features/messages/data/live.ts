import { createSessionRepository } from "./demo";

/**
 * Stub until the messaging backend exists (GA-07). Conversations a guest
 * starts with "Message host" are kept in this tab, the sample threads are left
 * out, and the composer stays disabled (`source: "none"`).
 *
 * Replace it with an implementation of `MessagesRepository` that subscribes
 * to the backend (see the README) and reports `source: "live"`.
 */
export const liveMessages = createSessionRepository({
  source: "none",
  includeSamples: false,
});
