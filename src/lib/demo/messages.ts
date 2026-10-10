import type { Demo } from "./index";
import { seededRandom, seedFor } from "./index";

export type DemoMessage = Demo<{
  id: string;
  body: string;
  is_automated: boolean;
  event_type: string | null;
  read_at: string | null;
  created_at: string;
  sender: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}>;

export type DemoConversation = Demo<{
  id: string;
  last_message_at: string | null;
  apartment: { name: string };
  host: { id: string; first_name: string; last_name: string };
  guest: { id: string; first_name: string; last_name: string };
  messages: Array<{
    body: string;
    created_at: string;
    sender: { first_name: string };
  }>;
}>;

const APARTMENTS = [
  "Downtown Loft Apartment",
  "Seaside Condo",
  "Cozy Cabin",
  "La sabana sur",
  "Los yoses",
  "Paseo Colon Loft",
  "Heredia Central",
  "Alajuela Heights",
  "Cartago View",
  "Moderno Apartamento en San Jose Centro",
  "Suite Ejecutiva Sabana Norte",
];

const HOSTS = [
  ["Jordan", "D."],
  ["Alex", "P."],
  ["Sam", "R."],
  ["Taylor", "C."],
  ["Morgan", "V."],
];

const OPENING_MESSAGES = [
  "Is this place available for my dates?",
  "Could you tell me a little more about the apartment?",
  "Does the listing include parking?",
  "What time is check-in?",
];

export function getDemoMessages(
  uid: string,
  conversationId: string,
): DemoMessage[] {
  const match = /^conv-(\d+)$/.exec(conversationId);
  const index = match ? Number(match[1]) - 1 : -1;
  if (index < 0 || index >= APARTMENTS.length) return [];
  const random = seededRandom(seedFor(`${uid}:${conversationId}`));
  const host = HOSTS[Math.floor(random() * HOSTS.length)];
  const opening =
    OPENING_MESSAGES[Math.floor(random() * OPENING_MESSAGES.length)];
  const baseTime = Date.UTC(2025, 2, 1) - index * 3600000;
  const guestName = "Demo guest";
  const guestEmail = `${uid.slice(0, 8)}@demo.invalid`;
  const hostId = `demo-host-${index + 1}`;

  return [
    {
      isDemo: true,
      id: `demo-message-${index + 1}-1`,
      body: opening,
      is_automated: false,
      event_type: null,
      read_at: null,
      created_at: new Date(baseTime).toISOString(),
      sender: {
        id: uid,
        first_name: guestName,
        last_name: "",
        email: guestEmail,
      },
    },
    {
      isDemo: true,
      id: `demo-message-${index + 1}-2`,
      body: `Thanks for reaching out. This is a sample reply for ${APARTMENTS[index]}.`,
      is_automated: false,
      event_type: null,
      read_at: null,
      created_at: new Date(baseTime + 60000).toISOString(),
      sender: {
        id: hostId,
        first_name: host[0],
        last_name: host[1],
        email: `${hostId}@demo.invalid`,
      },
    },
  ];
}

export function getDemoConversations(uid: string): DemoConversation[] {
  return APARTMENTS.map((name, index) => {
    const id = `conv-${index + 1}`;
    const messages = getDemoMessages(uid, id);
    const lastMessage = messages[messages.length - 1];

    return {
      isDemo: true,
      id,
      last_message_at: lastMessage.created_at,
      apartment: { name },
      host: {
        id: messages[1].sender.id,
        first_name: messages[1].sender.first_name,
        last_name: messages[1].sender.last_name,
      },
      guest: { id: uid, first_name: "Demo", last_name: "guest" },
      messages: [
        {
          body: lastMessage.body,
          created_at: lastMessage.created_at,
          sender: { first_name: lastMessage.sender.first_name },
        },
      ],
    };
  });
}
