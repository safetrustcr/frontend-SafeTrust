export type Participant = { id: string; first_name: string; last_name: string };

export type Message = {
  id: string;
  body: string;
  is_automated: boolean;
  event_type: string | null;
  read_at: string | null;
  created_at: string;
  sender: Participant & { email: string };
};

export type Conversation = {
  id: string;
  last_message_at: string | null;
  listing: { id: string; name: string };
  host: Participant;
  guest: Participant;
  /** Only the latest message (inbox preview); the thread uses `Message`. */
  messages: Array<{
    body: string;
    created_at: string;
    sender: { first_name: string };
  }>;
  /** Participant ids that have not opened the latest message yet. */
  unreadFor: string[];
};

/**
 * Where conversations come from: `demo` sample data, the `live` messaging
 * backend, or `none` (signed out, or no backend yet). Only `demo` lets the
 * composer send.
 */
export type MessagesSource = "demo" | "live" | "none";
