import { getConversationIdForApartment } from "../conversationRoutes";

describe("getConversationIdForApartment", () => {
  it("maps every /rent listing to a stub conversation", () => {
    expect(getConversationIdForApartment("La sabana sur")).toBe("conv-4");
    expect(getConversationIdForApartment("Los yoses")).toBe("conv-5");
    expect(getConversationIdForApartment("Paseo Colón Loft")).toBe("conv-6");
    expect(getConversationIdForApartment("Heredia Central")).toBe("conv-7");
    expect(getConversationIdForApartment("Alajuela Heights")).toBe("conv-8");
    expect(getConversationIdForApartment("Cartago View")).toBe("conv-9");
  });

  it("maps every /guest/suggestions apartment to a stub conversation", () => {
    expect(
      getConversationIdForApartment("Moderno Apartamento en San José Centro"),
    ).toBe("conv-10");
    expect(getConversationIdForApartment("Suite Ejecutiva Sabana Norte")).toBe(
      "conv-11",
    );
  });

  it("matches case-insensitively and trims whitespace", () => {
    expect(getConversationIdForApartment("  LA SABANA SUR  ")).toBe("conv-4");
  });

  it("maps enriched listing names to their existing conversations", () => {
    expect(
      getConversationIdForApartment("Casa Níspero, Barrio Escalante"),
    ).toBe("conv-4");
    expect(getConversationIdForApartment("Luz de Los Yoses Studio")).toBe(
      "conv-5",
    );
    expect(getConversationIdForApartment("Paseo Colón City Loft")).toBe(
      "conv-6",
    );
    expect(getConversationIdForApartment("Jardín de Heredia House")).toBe(
      "conv-7",
    );
    expect(getConversationIdForApartment("Airport Garden Apartment")).toBe(
      "conv-8",
    );
    expect(getConversationIdForApartment("El Guarco Study Apartment")).toBe(
      "conv-9",
    );
  });

  it("returns undefined for an unknown apartment", () => {
    expect(getConversationIdForApartment("Nonexistent Villa")).toBeUndefined();
  });
});
