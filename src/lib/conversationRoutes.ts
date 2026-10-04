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

export function getConversationIdForApartment(
  apartmentName: string,
): string | undefined {
  const normalized = apartmentName.trim().toLowerCase();
  const index = CONVERSATION_APARTMENTS.findIndex(
    (name) => name.trim().toLowerCase() === normalized,
  );
  return index < 0 ? undefined : `conv-${index + 1}`;
}
