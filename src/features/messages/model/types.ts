export type MessagePerson = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
};

export type ConversationMessage = {
  id: string;
  body: string;
  isDemo?: true;
  is_automated: boolean;
  event_type: string | null;
  read_at: string | null;
  created_at: string;
  sender: MessagePerson;
};

export type Conversation = {
  id: string;
  isDemo?: true;
  last_message_at: string | null;
  apartment: { name: string };
  host: MessagePerson;
  guest: MessagePerson;
  messages: Array<{
    body: string;
    created_at: string;
    sender: Pick<MessagePerson, "first_name">;
  }>;
};

export type MessageSource = "demo" | "live" | "none";

export type RepositoryResult<T> = {
  data: T;
  source: MessageSource;
};
