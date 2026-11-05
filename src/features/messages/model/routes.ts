/**
 * Legacy stub ids (`conv-N`) for the apartments on `/guest/suggestions`. Real
 * conversations are keyed by listing and guest (see `data/demo.ts`).
 */
const CONVERSATION_APARTMENTS = [
  "Downtown Loft Apartment",
  "Seaside Condo",
  "Cozy Cabin",
  "La sabana sur",
  "Los yoses",
  "Paseo Colón Loft",
  "Heredia Central",
  "Alajuela Heights",
  "Cartago View",
  "Moderno Apartamento en San José Centro",
  "Suite Ejecutiva Sabana Norte",
];

const ENRICHED_APARTMENT_CONVERSATIONS = new Map([
  ["casa níspero, barrio escalante", "conv-4"],
  ["luz de los yoses studio", "conv-5"],
  ["paseo colón city loft", "conv-6"],
  ["jardín de heredia house", "conv-7"],
  ["airport garden apartment", "conv-8"],
  ["el guarco study apartment", "conv-9"],
]);

export function getConversationIdForApartment(
  apartmentName: string,
): string | undefined {
  const normalized = apartmentName.trim().toLowerCase();
  const enrichedConversation = ENRICHED_APARTMENT_CONVERSATIONS.get(normalized);
  if (enrichedConversation) return enrichedConversation;

  const index = CONVERSATION_APARTMENTS.findIndex(
    (name) => name.trim().toLowerCase() === normalized,
  );
  return index < 0 ? undefined : `conv-${index + 1}`;
}

export const MESSAGES_HREF = "/dashboard/messages";

/** The thread route for a conversation id. */
export const conversationHref = (conversationId: string) =>
  `${MESSAGES_HREF}/${conversationId}`;
