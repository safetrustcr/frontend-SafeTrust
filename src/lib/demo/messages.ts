import { createStore } from "zustand/vanilla";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ApartmentListing } from "@/types/hotel";
import { APARTMENT_LISTINGS } from "@/lib/mockData/apartmentListings";
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

type Participant = { id: string; first_name: string; last_name: string };

export type DemoConversation = Demo<{
  id: string;
  last_message_at: string | null;
  listing: { id: string; name: string };
  host: Participant;
  guest: Participant;
  messages: Array<{
    body: string;
    created_at: string;
    sender: { first_name: string };
  }>;
  /** Participant ids that have not opened the latest message yet. */
  unreadFor: string[];
}>;

/** Listings that come with a sample thread (guest question + host reply). */
const SAMPLE_LISTING_IDS = ["2", "3", "5"];

const OPENING_MESSAGES = [
  "Is this place available for my dates?",
  "Could you tell me a little more about the apartment?",
  "Does the listing include parking?",
  "What time is check-in?",
];

export const demoConversationId = (listingId: string, guestUid: string) =>
  `demo-${listingId}-${guestUid}`;

const findListing = (uid: string, conversationId: string) =>
  APARTMENT_LISTINGS.find(
    (listing) => demoConversationId(listing.id, uid) === conversationId,
  );

const hostOf = (listing: ApartmentListing): Participant => {
  const [first_name, ...rest] = listing.owner.name.split(" ");
  return {
    id: `demo-host-${listing.id}`,
    first_name,
    last_name: rest.join(" "),
  };
};

const guestOf = (uid: string): Participant => ({
  id: uid,
  first_name: "Demo",
  last_name: "guest",
});

type DemoConversationState = {
  /** uid → listing ids the guest started a conversation for, newest first. */
  started: Record<string, string[]>;
  /** uid → conversation ids the user has opened. */
  read: Record<string, string[]>;
};

// Demo persistence: this browser tab only. GA-07 replaces it with the API.
export const demoConversationStore = createStore<DemoConversationState>()(
  persist(() => ({ started: {}, read: {} }), {
    name: "safetrust-demo-conversations",
    storage: createJSONStorage(() => sessionStorage),
  }),
);

/** Starts (once) the conversation between `uid` and the host of `listing`. */
export function ensureDemoConversation(uid: string, listing: ApartmentListing) {
  if (SAMPLE_LISTING_IDS.includes(listing.id)) return;
  demoConversationStore.setState((state) => {
    const current = state.started[uid] ?? [];
    if (current.includes(listing.id)) return state;
    return { started: { ...state.started, [uid]: [listing.id, ...current] } };
  });
}

export function markDemoConversationRead(uid: string, conversationId: string) {
  demoConversationStore.setState((state) => {
    const current = state.read[uid] ?? [];
    if (current.includes(conversationId)) return state;
    return { read: { ...state.read, [uid]: [...current, conversationId] } };
  });
}

export function getDemoMessages(
  uid: string,
  conversationId: string,
): DemoMessage[] {
  const listing = findListing(uid, conversationId);
  if (!listing || !SAMPLE_LISTING_IDS.includes(listing.id)) return [];
  const random = seededRandom(seedFor(`${uid}:${conversationId}`));
  const opening =
    OPENING_MESSAGES[Math.floor(random() * OPENING_MESSAGES.length)];
  const baseTime =
    Date.UTC(2025, 2, 1) - SAMPLE_LISTING_IDS.indexOf(listing.id) * 3600000;
  const guest = guestOf(uid);
  const host = hostOf(listing);

  return [
    {
      isDemo: true,
      id: `demo-message-${listing.id}-1`,
      body: opening,
      is_automated: false,
      event_type: null,
      read_at: null,
      created_at: new Date(baseTime).toISOString(),
      sender: { ...guest, email: `${uid.slice(0, 8)}@demo.invalid` },
    },
    {
      isDemo: true,
      id: `demo-message-${listing.id}-2`,
      body: `Thanks for reaching out. This is a sample reply for ${listing.name}.`,
      is_automated: false,
      event_type: null,
      read_at: null,
      created_at: new Date(baseTime + 60000).toISOString(),
      sender: { ...host, email: `${host.id}@demo.invalid` },
    },
  ];
}

/**
 * Conversations for `uid`: the ones they started from "Message host", then
 * (in demo mode) the sample threads.
 */
export function getDemoConversations(
  uid: string,
  {
    includeSamples,
    started = [],
    read = [],
  }: { includeSamples: boolean; started?: string[]; read?: string[] },
): DemoConversation[] {
  const listingIds = includeSamples
    ? [...started, ...SAMPLE_LISTING_IDS]
    : started;

  return listingIds.flatMap((listingId) => {
    const listing = APARTMENT_LISTINGS.find((item) => item.id === listingId);
    if (!listing) return [];
    const id = demoConversationId(listing.id, uid);
    const messages = getDemoMessages(uid, id);
    const lastMessage = messages.at(-1);

    return [
      {
        isDemo: true,
        id,
        last_message_at: lastMessage?.created_at ?? null,
        listing: { id: listing.id, name: listing.name },
        host: hostOf(listing),
        guest: guestOf(uid),
        messages: lastMessage
          ? [
              {
                body: lastMessage.body,
                created_at: lastMessage.created_at,
                sender: { first_name: lastMessage.sender.first_name },
              },
            ]
          : [],
        unreadFor:
          lastMessage && lastMessage.sender.id !== uid && !read.includes(id)
            ? [uid]
            : [],
      },
    ];
  });
}
