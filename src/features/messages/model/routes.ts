/** The host-facing inbox, inside the dashboard. */
export const MESSAGES_HREF = "/dashboard/messages";
/** The guest-facing inbox: no dashboard chrome, only the guest's own threads. */
export const GUEST_MESSAGES_HREF = "/guest/messages";

/** The thread route for a conversation id, in the given inbox. */
export const conversationHref = (
  conversationId: string,
  base: string = MESSAGES_HREF,
) => `${base}/${conversationId}`;
