export const MOCK_CURRENT_USER = {
  uid: "mock-guest-1",
  first_name: "Guest",
  last_name: "User",
};

export const MOCK_CONVERSATIONS = [
  {
    id: "conv-1",
    last_message_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    apartment: { name: "Downtown Loft Apartment" },
    host: {
      id: "mock-host-1",
      first_name: "John",
      last_name: "D.",
    },
    guest: {
      id: "mock-guest-1",
      first_name: "Guest",
      last_name: "User",
    },
    messages: [
      {
        body: "Hi John, is this loft available?",
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        sender: { first_name: "Guest" },
      },
    ],
  },
  {
    id: "conv-2",
    last_message_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    apartment: { name: "Seaside Condo" },
    host: {
      id: "mock-host-2",
      first_name: "Alice",
      last_name: "P.",
    },
    guest: {
      id: "mock-guest-1",
      first_name: "Guest",
      last_name: "User",
    },
    messages: [
      {
        body: "Is parking included?",
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        sender: { first_name: "Guest" },
      },
    ],
  },
  {
    id: "conv-3",
    last_message_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    apartment: { name: "Cozy Cabin" },
    host: {
      id: "mock-host-3",
      first_name: "Bob",
      last_name: "S.",
    },
    guest: {
      id: "mock-guest-1",
      first_name: "Guest",
      last_name: "User",
    },
    messages: [
      {
        body: "What is the check-in time?",
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        sender: { first_name: "Guest" },
      },
    ],
  },
  // Guest-view apartments (issue #447): one stub conversation per apartment
  // shown on /guest/suggestions and /rent, so "Message host" always lands on
  // a matching thread.
  {
    id: "conv-4",
    last_message_at: new Date(Date.now() - 60 * 1000).toISOString(),
    apartment: { name: "La sabana sur" },
    host: {
      id: "mock-host-4",
      first_name: "Alberto",
      last_name: "Casas",
    },
    guest: {
      id: "mock-guest-1",
      first_name: "Guest",
      last_name: "User",
    },
    messages: [
      {
        body: "Hi, is this apartment available?",
        created_at: new Date(Date.now() - 60 * 1000).toISOString(),
        sender: { first_name: "Guest" },
      },
    ],
  },
  {
    id: "conv-5",
    last_message_at: new Date(Date.now() - 60 * 1000).toISOString(),
    apartment: { name: "Los yoses" },
    host: {
      id: "mock-host-5",
      first_name: "Randall",
      last_name: "Valenciano",
    },
    guest: {
      id: "mock-guest-1",
      first_name: "Guest",
      last_name: "User",
    },
    messages: [
      {
        body: "Hi, is this apartment available?",
        created_at: new Date(Date.now() - 60 * 1000).toISOString(),
        sender: { first_name: "Guest" },
      },
    ],
  },
  {
    id: "conv-6",
    last_message_at: new Date(Date.now() - 60 * 1000).toISOString(),
    apartment: { name: "Paseo Colón Loft" },
    host: {
      id: "mock-host-6",
      first_name: "María",
      last_name: "López",
    },
    guest: {
      id: "mock-guest-1",
      first_name: "Guest",
      last_name: "User",
    },
    messages: [
      {
        body: "Hi, is this apartment available?",
        created_at: new Date(Date.now() - 60 * 1000).toISOString(),
        sender: { first_name: "Guest" },
      },
    ],
  },
  {
    id: "conv-7",
    last_message_at: new Date(Date.now() - 60 * 1000).toISOString(),
    apartment: { name: "Heredia Central" },
    host: {
      id: "mock-host-7",
      first_name: "Luis",
      last_name: "Salas",
    },
    guest: {
      id: "mock-guest-1",
      first_name: "Guest",
      last_name: "User",
    },
    messages: [
      {
        body: "Hi, is this apartment available?",
        created_at: new Date(Date.now() - 60 * 1000).toISOString(),
        sender: { first_name: "Guest" },
      },
    ],
  },
  {
    id: "conv-8",
    last_message_at: new Date(Date.now() - 60 * 1000).toISOString(),
    apartment: { name: "Alajuela Heights" },
    host: {
      id: "mock-host-8",
      first_name: "Ana",
      last_name: "Ruiz",
    },
    guest: {
      id: "mock-guest-1",
      first_name: "Guest",
      last_name: "User",
    },
    messages: [
      {
        body: "Hi, is this apartment available?",
        created_at: new Date(Date.now() - 60 * 1000).toISOString(),
        sender: { first_name: "Guest" },
      },
    ],
  },
  {
    id: "conv-9",
    last_message_at: new Date(Date.now() - 60 * 1000).toISOString(),
    apartment: { name: "Cartago View" },
    host: {
      id: "mock-host-9",
      first_name: "Sofía",
      last_name: "Mora",
    },
    guest: {
      id: "mock-guest-1",
      first_name: "Guest",
      last_name: "User",
    },
    messages: [
      {
        body: "Hi, is this apartment available?",
        created_at: new Date(Date.now() - 60 * 1000).toISOString(),
        sender: { first_name: "Guest" },
      },
    ],
  },
  {
    id: "conv-10",
    last_message_at: new Date(Date.now() - 60 * 1000).toISOString(),
    apartment: { name: "Moderno Apartamento en San José Centro" },
    host: {
      id: "mock-host-10",
      first_name: "Carlos",
      last_name: "Méndez",
    },
    guest: {
      id: "mock-guest-1",
      first_name: "Guest",
      last_name: "User",
    },
    messages: [
      {
        body: "Hi, is this apartment available?",
        created_at: new Date(Date.now() - 60 * 1000).toISOString(),
        sender: { first_name: "Guest" },
      },
    ],
  },
  {
    id: "conv-11",
    last_message_at: new Date(Date.now() - 60 * 1000).toISOString(),
    apartment: { name: "Suite Ejecutiva Sabana Norte" },
    host: {
      id: "mock-host-11",
      first_name: "Andrés",
      last_name: "Vega",
    },
    guest: {
      id: "mock-guest-1",
      first_name: "Guest",
      last_name: "User",
    },
    messages: [
      {
        body: "Hi, is this apartment available?",
        created_at: new Date(Date.now() - 60 * 1000).toISOString(),
        sender: { first_name: "Guest" },
      },
    ],
  },
];

/**
 * Resolve the stub conversation for an apartment shown in the guest browse
 * views (/guest/suggestions and /rent). Matching is case-insensitive against
 * the apartment names in MOCK_CONVERSATIONS.
 */
export function getConversationIdForApartment(
  apartmentName: string,
): string | undefined {
  const normalized = apartmentName.trim().toLowerCase();
  return MOCK_CONVERSATIONS.find(
    (conversation) =>
      conversation.apartment.name.trim().toLowerCase() === normalized,
  )?.id;
}

export type MockMessage = {
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
};

export const MOCK_MESSAGES: Record<string, MockMessage[]> = {
  "conv-1": [
    {
      id: "msg-1",
      body: "Hi John, is this loft available?",
      is_automated: false,
      event_type: null,
      read_at: null,
      created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      sender: {
        id: "mock-guest-1",
        first_name: "Guest",
        last_name: "User",
        email: "guest@test.com",
      },
    },
    {
      id: "msg-2",
      body: "Hi, yes the loft is available. After booking you will use SafeTrust escrow for payment.",
      is_automated: false,
      event_type: null,
      read_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      sender: {
        id: "mock-host-1",
        first_name: "John",
        last_name: "D.",
        email: "john@host.com",
      },
    },
    {
      id: "msg-3",
      body: "BOOKING CONFIRMED\nUnique Escrow ID: {uuid1}",
      is_automated: true,
      event_type: "escrow_funded",
      read_at: null,
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      sender: {
        id: "system",
        first_name: "SafeTrust",
        last_name: "System",
        email: "system@safetrust.com",
      },
    },
    {
      id: "msg-4",
      body: "ESCROW FUNDED\nTenant deposit confirmed on Stellar. Unique Escrow ID: {uuid1}",
      is_automated: true,
      event_type: "escrow_funded",
      read_at: null,
      created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      sender: {
        id: "system",
        first_name: "SafeTrust",
        last_name: "System",
        email: "system@safetrust.com",
      },
    },
    {
      id: "msg-5",
      body: "Hi John, is this loft available?",
      is_automated: false,
      event_type: null,
      read_at: null,
      created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      sender: {
        id: "mock-guest-1",
        first_name: "Guest",
        last_name: "User",
        email: "guest@test.com",
      },
    },
  ],
  "conv-2": [
    {
      id: "msg-6",
      body: "Is parking included?",
      is_automated: false,
      event_type: null,
      read_at: null,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      sender: {
        id: "mock-guest-1",
        first_name: "Guest",
        last_name: "User",
        email: "guest@test.com",
      },
    },
  ],
  "conv-3": [
    {
      id: "msg-7",
      body: "What is the check-in time?",
      is_automated: false,
      event_type: null,
      read_at: null,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      sender: {
        id: "mock-guest-1",
        first_name: "Guest",
        last_name: "User",
        email: "guest@test.com",
      },
    },
  ],
  "conv-4": [
    {
      id: "msg-8",
      body: "Hi, is this apartment available?",
      is_automated: false,
      event_type: null,
      read_at: null,
      created_at: new Date(Date.now() - 60 * 1000).toISOString(),
      sender: {
        id: "mock-guest-1",
        first_name: "Guest",
        last_name: "User",
        email: "guest@test.com",
      },
    },
  ],
  "conv-5": [
    {
      id: "msg-9",
      body: "Hi, is this apartment available?",
      is_automated: false,
      event_type: null,
      read_at: null,
      created_at: new Date(Date.now() - 60 * 1000).toISOString(),
      sender: {
        id: "mock-guest-1",
        first_name: "Guest",
        last_name: "User",
        email: "guest@test.com",
      },
    },
  ],
  "conv-6": [
    {
      id: "msg-10",
      body: "Hi, is this apartment available?",
      is_automated: false,
      event_type: null,
      read_at: null,
      created_at: new Date(Date.now() - 60 * 1000).toISOString(),
      sender: {
        id: "mock-guest-1",
        first_name: "Guest",
        last_name: "User",
        email: "guest@test.com",
      },
    },
  ],
  "conv-7": [
    {
      id: "msg-11",
      body: "Hi, is this apartment available?",
      is_automated: false,
      event_type: null,
      read_at: null,
      created_at: new Date(Date.now() - 60 * 1000).toISOString(),
      sender: {
        id: "mock-guest-1",
        first_name: "Guest",
        last_name: "User",
        email: "guest@test.com",
      },
    },
  ],
  "conv-8": [
    {
      id: "msg-12",
      body: "Hi, is this apartment available?",
      is_automated: false,
      event_type: null,
      read_at: null,
      created_at: new Date(Date.now() - 60 * 1000).toISOString(),
      sender: {
        id: "mock-guest-1",
        first_name: "Guest",
        last_name: "User",
        email: "guest@test.com",
      },
    },
  ],
  "conv-9": [
    {
      id: "msg-13",
      body: "Hi, is this apartment available?",
      is_automated: false,
      event_type: null,
      read_at: null,
      created_at: new Date(Date.now() - 60 * 1000).toISOString(),
      sender: {
        id: "mock-guest-1",
        first_name: "Guest",
        last_name: "User",
        email: "guest@test.com",
      },
    },
  ],
  "conv-10": [
    {
      id: "msg-14",
      body: "Hi, is this apartment available?",
      is_automated: false,
      event_type: null,
      read_at: null,
      created_at: new Date(Date.now() - 60 * 1000).toISOString(),
      sender: {
        id: "mock-guest-1",
        first_name: "Guest",
        last_name: "User",
        email: "guest@test.com",
      },
    },
  ],
  "conv-11": [
    {
      id: "msg-15",
      body: "Hi, is this apartment available?",
      is_automated: false,
      event_type: null,
      read_at: null,
      created_at: new Date(Date.now() - 60 * 1000).toISOString(),
      sender: {
        id: "mock-guest-1",
        first_name: "Guest",
        last_name: "User",
        email: "guest@test.com",
      },
    },
  ],
};
